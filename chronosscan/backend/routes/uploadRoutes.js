const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');

const fs = require('fs');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Path: frontend/public/dataset/patient_id/
        // Adjusted relative to backend/routes/
        const patientId = req.body.patient_id || 'unknown';
        const dir = path.join(__dirname, '../../frontend/public/dataset', patientId);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Keep original name or safe name
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('scan'), uploadController.uploadScan);
router.get('/patient/:patient_id', uploadController.getScansByPatient);
router.get('/:id', uploadController.getScanById);

module.exports = router;
