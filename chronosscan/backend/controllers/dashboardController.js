const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        // Run queries in parallel for performance
        const [patientCount] = await db.execute('SELECT COUNT(*) as count FROM patients');
        const [scanCount] = await db.execute('SELECT COUNT(*) as count FROM scans');
        const [reportCount] = await db.execute('SELECT COUNT(*) as count FROM reports');

        // For anomalies, we might search for keywords like 'anomaly' or 'tumor' in reports if we don't have a specific flags column yet
        // This is a basic approximation
        const [anomalyCount] = await db.execute(`
            SELECT COUNT(*) as count FROM reports 
            WHERE report_text LIKE '%anomaly%' 
            OR report_text LIKE '%tumor%' 
            OR report_text LIKE '%mass%'
        `);

        res.json({
            patients: Number(patientCount[0].count),
            scans: Number(scanCount[0].count),
            reports: Number(reportCount[0].count),
            anomalies: Number(anomalyCount[0].count)
        });
        console.log('Dashboard stats sent:', {
            patients: patientCount[0].count,
            scans: scanCount[0].count,
            reports: reportCount[0].count,
            anomalies: anomalyCount[0].count
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};
