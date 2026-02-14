import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ScanUpload = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patient_id: '',
        scan_date: new Date().toISOString().split('T')[0],
        scan_type: 'CT Chest',
        file: null
    });
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/patient');
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };
        fetchPatients();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patient_id || !formData.file) {
            alert("Please select a patient and a file.");
            return;
        }
        setLoading(true);
        const data = new FormData();
        data.append('patient_id', formData.patient_id);
        data.append('scan_date', formData.scan_date);
        data.append('scan_type', formData.scan_type);
        data.append('scan', formData.file);

        try {
            const response = await api.post('/upload-scan', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/analyze/${response.data.scanId}`);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="mb-4">
                <h2 className="fw-bold">Upload New Scan</h2>
                <p className="text-secondary">Add a new medical image for analysis.</p>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white p-3"></div>

                <div className="card-body p-4 p-md-5">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">
                                    <i className="bi bi-person me-2"></i>Select Patient
                                </label>
                                <select
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleChange}
                                    className="form-select form-select-lg"
                                    required
                                >
                                    <option value="">Choose patient...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">
                                    <i className="bi bi-calendar me-2"></i>Scan Date
                                </label>
                                <input
                                    type="date"
                                    name="scan_date"
                                    value={formData.scan_date}
                                    onChange={handleChange}
                                    className="form-control form-control-lg"
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold small text-secondary">Scan Modality</label>
                                <div className="btn-group w-100" role="group">
                                    {['CT Chest', 'MRI Brain', 'X-Ray'].map(type => (
                                        <React.Fragment key={type}>
                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="scan_type"
                                                id={`option-${type}`}
                                                value={type}
                                                checked={formData.scan_type === type}
                                                onChange={handleChange}
                                            />
                                            <label className="btn btn-outline-primary" htmlFor={`option-${type}`}>{type}</label>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-secondary">DICOM/Image File</label>
                            <input
                                type="file"
                                className="form-control"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                            <div className="form-text">Supported formats: JPG, PNG, DICOM</div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold d-flex justify-content-center align-items-center gap-2" disabled={loading}>
                            {loading ? (
                                <div className="spinner-border spinner-border-sm" role="status"></div>
                            ) : (
                                <i className="bi bi-cloud-upload"></i>
                            )}
                            {loading ? ' Processing...' : ' Start Analysis'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScanUpload;
