const db = require('../config/db');

exports.createPatient = async (req, res) => {
    try {
        const { name, age, gender } = req.body;
        const [result] = await db.execute(
            'INSERT INTO patients (name, age, gender) VALUES (?, ?, ?)',
            [name, age, gender]
        );
        res.status(201).json({ id: result.insertId, name, age, gender });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPatients = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM patients ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const [patient] = await db.execute('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (patient.length === 0) return res.status(404).json({ error: 'Patient not found' });

        const [scans] = await db.execute('SELECT * FROM scans WHERE patient_id = ? ORDER BY scan_date DESC', [req.params.id]);

        res.json({ ...patient[0], scans });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
