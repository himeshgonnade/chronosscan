const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/uploadRoutes');
const patientRoutes = require('./routes/patientRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Serve static files from frontend/public for scans
const path = require('path');
app.use('/dataset', express.static(path.join(__dirname, '../frontend/public/dataset')));

// Routes
app.use('/api/patient', patientRoutes);
app.use('/api/upload-scan', uploadRoutes);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/', (req, res) => {
    res.send('ChronosScan API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
