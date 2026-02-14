import faiss
import numpy as np
import os
import json
from sentence_transformers import SentenceTransformer
# import openai # Uncomment if using real OpenAI

class PatientRAG:
    def __init__(self, index_folder="faiss_indexes"):
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.index_folder = index_folder
        if not os.path.exists(index_folder):
            os.makedirs(index_folder)

    def _get_index_path(self, patient_id):
        return os.path.join(self.index_folder, f"{patient_id}.index")
    
    def _get_metadata_path(self, patient_id):
        return os.path.join(self.index_folder, f"{patient_id}_meta.json")

    def create_or_load_index(self, patient_id):
        index_path = self._get_index_path(patient_id)
        if os.path.exists(index_path):
            index = faiss.read_index(index_path)
            with open(self._get_metadata_path(patient_id), 'r') as f:
                metadata = json.load(f)
        else:
            # Dimension of all-MiniLM-L6-v2 is 384
            index = faiss.IndexFlatL2(384)
            metadata = []
        return index, metadata

    def save_index(self, patient_id, index, metadata):
        faiss.write_index(index, self._get_index_path(patient_id))
        with open(self._get_metadata_path(patient_id), 'w') as f:
            json.dump(metadata, f)

    def add_report(self, patient_id, report_text, scan_date):
        index, metadata = self.create_or_load_index(patient_id)
        
        # Encode
        embedding = self.encoder.encode([report_text])
        
        # Add to index
        index.add(np.array(embedding).astype('float32'))
        
        # Add metadata
        metadata.append({
            "text": report_text,
            "date": scan_date
        })
        
        self.save_index(patient_id, index, metadata)
        return True

    def retrieve_context(self, patient_id, query, k=3):
        index, metadata = self.create_or_load_index(patient_id)
        if index.ntotal == 0:
            return []
            
        # Encode query
        query_vec = self.encoder.encode([query])
        
        # Search
        D, I = index.search(np.array(query_vec).astype('float32'), k)
        
        results = []
        for i in range(len(I[0])):
            idx = I[0][i]
            if idx != -1 and idx < len(metadata):
                results.append(metadata[idx])
                
        return results

    def generate_clinical_summary(self, context, cnn_results, patient_data):
        """
        Mock LLM generation or call OpenAI.
        """
        # Construct prompt
        context_text = "\n".join([f"- {r['date']}: {r['text']}" for r in context])
        
        prompt = f"""
        Patient: {patient_data['name']} ({patient_data['age']} {patient_data['gender']})
        
        Previous History:
        {context_text}
        
        Current Scan Analysis:
        - Change: {cnn_results.get('change_percentage')}%
        - Anomaly Detected: {cnn_results.get('anomaly_detected')}
        
        Generate a concise clinical summary and recommendation.
        """
        
        # Mock Response
        summary = f"""
        **Progression Summary**:
        The scan shows a {cnn_results.get('change_percentage')}% change compared to the previous scan. 
        {'Anomaly detected.' if cnn_results.get('anomaly_detected') else 'No significant anomalies detected.'}
        
        **AI Interpretation**:
        Based on the previous history and current analysis, the patient's condition appears to be {'worsening' if cnn_results.get('anomaly_detected') else 'stable'}.
        
        **Recommendation**:
        {'Suggest immediate follow-up and biopsy.' if cnn_results.get('anomaly_detected') else 'Continue routine monitoring.'}
        """
        
        return summary.strip()
