from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pymysql
from dotenv import load_dotenv
import cv2
import numpy as np

# Import our modules
from cnn_model import MedicalCNN
from rag_pipeline import PatientRAG
from image_preprocessing import load_and_preprocess

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Models
cnn = MedicalCNN()
rag = PatientRAG()

# DB Connection
def get_db_connection():
    return pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        db=os.getenv('DB_NAME', 'chronosscan'),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route('/analyze', methods=['POST'])
def analyze_scan():
    data = request.json
    patient_id = data.get('patient_id')
    scan_id = data.get('scan_id')
    file_path = data.get('file_path') # Relative path like 'uploads/...'
    
    # Needs absolute path for AI service if running locally, or handle relative path
    # Assuming backend and AI service share the same root or volume
    # For this prototype, we'll assume they run on same machine
    
    # Fix path separation
    abs_file_path = os.path.abspath(os.path.join(os.getcwd(), '..', 'backend', file_path))
    if not os.path.exists(abs_file_path):
        # Try relative to current dir
        abs_file_path = file_path 
    
    print(f"Analyzing {abs_file_path} for patient {patient_id}")

    try:
        # 1. Fetch Previous Scan
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Get the previous scan (latest one before this one)
            sql = "SELECT scan_path, scan_date FROM scans WHERE patient_id=%s AND id != %s ORDER BY scan_date DESC LIMIT 1"
            cursor.execute(sql, (patient_id, scan_id))
            prev_scan = cursor.fetchone()
            
            # Get Patient Info
            cursor.execute("SELECT * FROM patients WHERE id=%s", (patient_id,))
            patient_data = cursor.fetchone()
        conn.close()

        cnn_results = {}
        heatmap_path = ""

        if prev_scan:
            prev_scan_path = os.path.abspath(os.path.join(os.getcwd(), '..', 'backend', prev_scan['scan_path']))
            if os.path.exists(prev_scan_path):
                # Run Comparison
                print(f"Comparing with {prev_scan_path}")
                cnn_results = cnn.compare_scans(abs_file_path, prev_scan_path)
                
                # Generate Heatmap (Mocked path for now)
                # In real app, save the heatmap image to public folder
                # heatmap_img = generate_heatmap(...)
                # cv2.imwrite(heatmap_path, heatmap_img)
                heatmap_path = f"uploads/heatmap_{scan_id}.jpg" # Placeholder
            else:
                cnn_results = {"change_percentage": 0, "anomaly_detected": False, "note": "Previous scan file not found"}
            else:
                cnn_results = {"change_percentage": 0, "anomaly_detected": False, "note": "Previous scan file not found"}
        else:
            cnn_results = {"change_percentage": 0, "anomaly_detected": False, "note": "No previous scan found"}

        # Get Classification
        prediction = cnn.predict_classification(abs_file_path)
        if prediction:
            cnn_results['classification'] = prediction

        # 2. RAG Retrieval
        context = rag.retrieve_context(patient_id, "scan analysis") # Simple query for now

        # 3. Generate Report
        report = rag.generate_clinical_summary(context, cnn_results, patient_data or {'name': 'Unknown'})

        # 4. Save Report to DB? Or just return it? 
        # The backend can save it. We return it.
        # But we should also index this new report for future RAG?
        # Maybe we index it AFTER the doctor approves it. For now, we just return it.

        return jsonify({
            "change_percentage": cnn_results.get('change_percentage', 0),
            "anomaly_detected": cnn_results.get('anomaly_detected', False),
            "classification": cnn_results.get('classification', 'Unknown'),
            "heatmap_path": heatmap_path,
            "report": report
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
