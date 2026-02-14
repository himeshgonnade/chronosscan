const { Ollama } = require("langchain/llms/ollama");
const { OllamaEmbeddings } = require("langchain/embeddings/ollama");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { Document } = require("langchain/document");
const db = require('../config/db');

class RAGService {
    constructor() {
        this.embeddings = new OllamaEmbeddings({
            model: "nomic-embed-text",
            baseUrl: "http://localhost:11434",
        });

        this.llm = new Ollama({
            model: "llama3", // User has llama3 installed
            baseUrl: "http://localhost:11434",
        });
    }

    async getPatientHistory(patientId) {
        // Fetch reports and scan notes from DB
        const [reports] = await db.execute(
            `SELECT r.report_text, s.scan_date, s.scan_type 
             FROM reports r 
             JOIN scans s ON r.scan_id = s.id 
             WHERE r.patient_id = ? 
             ORDER BY s.scan_date DESC`,
            [patientId]
        );
        return reports;
    }

    async generateClinicalSummary(patientId, currentScanAnalysis, doctorQuery) {
        try {
            // 1. Get History
            const history = await this.getPatientHistory(patientId);

            // 2. Create Documents for Vector Store
            const documents = history.map(h => new Document({
                pageContent: `Date: ${h.scan_date}, Type: ${h.scan_type}. Report: ${h.report_text}`,
                metadata: { source: "historical_report", date: h.scan_date }
            }));

            // Add current context
            documents.push(new Document({
                pageContent: `Current Scan Analysis: 
                Change: ${currentScanAnalysis.change_percentage}%
                Anomaly: ${currentScanAnalysis.anomaly_detected ? 'Yes' : 'No'}
                Features: ${JSON.stringify(currentScanAnalysis)}`,
                metadata: { source: "current_analysis", date: new Date().toISOString() }
            }));

            // 3. Create Vector Store (In-memory for this request context, or persisted if needed)
            // For per-request RAG where we want strictly this patient's history,
            // creating a transient store is fine if history is small (<100 docs).
            const vectorStore = await MemoryVectorStore.fromDocuments(
                documents,
                this.embeddings
            );

            // 4. Retrieve Context based on Doctor's Query or standard template
            const retriever = vectorStore.asRetriever();
            const relevantDocs = await retriever.invoke(doctorQuery || "Summarize patient progression and anomalies");

            const contextText = relevantDocs.map(d => d.pageContent).join("\n");

            // 5. Generate Summary
            const prompt = `
            You are an expert medical AI assistant specialized in radiology.
            Your task is to analyze the patient's history and the current scan analysis to provide a professional clinical summary.
            
            Context:
            ${contextText}
            
            Query:
            ${doctorQuery || "Provide a detailed clinical summary of the patient's status, noting any progression or anomalies."}
            
            Output Guidelines:
            - Use professional medical terminology.
            - Be concise but thorough.
            - Highlighting critical findings is mandatory.
            
            Response Structure:
            1. **Patient Status**: Current state based on the scan.
            2. **Longitudinal Assessment**: Comparison with previous history (identifying progression or regression).
            3. **AI Detected Features**: Specific anomalies or features found in the current scan.
            4. **Clinical Recommendations**: Suggsested next steps for the radiologist.
            `;

            const response = await this.llm.invoke(prompt);
            return response;

        } catch (error) {
            console.error("RAG Error:", error);
            return "AI Service Unavailable or Error in RAG Pipeline: " + error.message;
        }
    }
}

module.exports = new RAGService();
