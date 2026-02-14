# ChronosScan

ChronosScan is a longitudinal radiology tracker that uses AI (CNN + RAG) to analyze patient scans and detect progression or anomalies over time.

## Project Structure

- **frontend/**: React + Vite + Tailwind CSS
- **backend/**: Node.js + Express + MySQL
- **ai-service/**: Python + Flask + PyTorch + FAISS

## Prerequisites

- Node.js (v16+)
- Python (3.8+)
- MySQL Server

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client.
2. Run the script `database.sql` located in the root `chronosscan/` folder.
   ```sql
   source database.sql;
   ```
   Or copy-paste the contents into your SQL query window.

### 2. Backend Setup
```bash
cd chronosscan/backend
# Install dependencies
npm install

# Configure Environment
# Rename .env.example (if exists) or ensure .env has correct DB credentials
# DB_USER=root, DB_PASSWORD=yourpassword

# Run Server
npm run dev
# Server runs on http://localhost:5000
```

### 3. AI Service Setup
```bash
cd chronosscan/ai-service
# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run Service
python app.py
# Service runs on http://localhost:8000
```

### 4. Frontend Setup
```bash
cd chronosscan/frontend
# Install dependencies
npm install

# Run Frontend
npm run dev
# App runs on http://localhost:5173
```

## Usage Flow

1. **Register Patient**: Use the API or Dashboard (add patient feature coming soon, currently use SQL/Postman to add patients to `patients` table for testing). 
   *Sample SQL:*
   ```sql
   INSERT INTO patients (name, age, gender) VALUES ('John Doe', 45, 'Male');
   ```
2. **Upload Scan**: Go to "New Scan", select patient, date, type, and upload an image.
3. **Analysis**: The system automatically triggers analysis.
4. **View Report**: You will be redirected to the analysis view showing scan comparison and AI-generated report.

## API Endpoints

- `GET /api/patient`: List patients
- `GET /api/patient/:id`: Get patient details and history
- `POST /api/upload-scan`: Upload new scan
- `GET /api/upload-scan/:id`: Get scan analysis details
