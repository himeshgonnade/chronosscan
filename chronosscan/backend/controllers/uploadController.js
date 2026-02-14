const db = require('../config/db');
const path = require('path');
const axios = require('axios');

exports.uploadScan = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { patient_id, scan_date, scan_type } = req.body;
        // Normalize path: store as 'dataset/patient_id/filename'
        // req.file.path is absolute/full path because of our change in uploadRoutes
        // We need to convert it to relative path for frontend serving

        const fullPath = req.file.path.replace(/\\/g, '/');
        const relativePath = fullPath.split('frontend/public/')[1];
        const scanPath = relativePath || fullPath; // Fallback if split fails

        // 1. Save scan processing metadata to DB
        const [result] = await db.execute(
            'INSERT INTO scans (patient_id, scan_path, scan_date, scan_type) VALUES (?, ?, ?, ?)',
            [patient_id, scanPath, scan_date, scan_type]
        );

        const scanId = result.insertId;

        // 2. Trigger AI Analysis (Async)
        try {
            const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
            const aiResponse = await axios.post(`${aiServiceUrl}/analyze`, {
                scan_id: scanId,
                patient_id: patient_id,
                file_path: scanPath
            });

            // Update DB with results
            if (aiResponse.data) {
                await db.execute(
                    'UPDATE scans SET cnn_change_percentage = ?, anomaly_detected = ?, heatmap_path = ? WHERE id = ?',
                    [
                        aiResponse.data.change_percentage,
                        aiResponse.data.anomaly_detected,
                        aiResponse.data.heatmap_path,
                        scanId
                    ]
                );
            }
        } catch (aiError) {
            console.error("AI Service Error:", aiError.message);
        }

        res.status(201).json({
            message: 'Scan uploaded successfully',
            scanId: scanId,
            path: scanPath
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getScansByPatient = async (req, res) => {
    try {
        const [scans] = await db.execute('SELECT * FROM scans WHERE patient_id = ? ORDER BY scan_date DESC', [req.params.patient_id]);
        res.json(scans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getScanById = async (req, res) => {
    try {
        const scanId = req.params.id;
        const [scans] = await db.execute('SELECT * FROM scans WHERE id = ?', [scanId]);

        if (scans.length === 0) return res.status(404).json({ error: 'Scan not found' });

        const currentScan = scans[0];

        // Fetch Report
        const [reports] = await db.execute('SELECT report_text FROM reports WHERE scan_id = ? ORDER BY created_at DESC LIMIT 1', [scanId]);
        currentScan.report_text = reports.length > 0 ? reports[0].report_text : null;

        // Find previous scan
        const [prevScans] = await db.execute(
            'SELECT * FROM scans WHERE patient_id = ? AND scan_date < ? ORDER BY scan_date DESC LIMIT 1',
            [currentScan.patient_id, currentScan.scan_date]
        );

        const prevScan = prevScans.length > 0 ? prevScans[0] : null;

        res.json({
            current: currentScan,
            previous: prevScan
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
