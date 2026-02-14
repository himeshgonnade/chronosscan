import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const PatientDetails = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await api.get(`/patient/${id}`);
                setPatient(response.data);
                setScans(response.data.scans || []);
            } catch (error) {
                console.error('Error fetching patient:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [id]);

    if (loading) return (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    if (!patient) return <div className="alert alert-warning m-4">Patient not found</div>;

    return (
        <div className="container-fluid">
            {/* Header Card */}
            <div className="card border-0 shadow-sm mb-4 overflow-hidden">
                <div className="card-header bg-primary text-white p-4 position-relative">
                    <Link to="/patients" className="text-white text-decoration-none d-flex align-items-center gap-2 mb-3" style={{ opacity: 0.9 }}>
                        <i className="bi bi-arrow-left"></i> Back to List
                    </Link>
                    <div className="d-flex align-items-end justify-content-between">
                        <div className="d-flex align-items-center gap-4">
                            <div className="bg-white rounded p-1 shadow">
                                <div className="bg-light d-flex align-items-center justify-content-center text-primary" style={{ width: 80, height: 80 }}>
                                    <i className="bi bi-person-fill fs-1"></i>
                                </div>
                            </div>
                            <div>
                                <h1 className="fw-bold mb-0 text-white">{patient.name}</h1>
                                <p className="mb-0 text-white-50">ID: {patient.id}</p>
                            </div>
                        </div>
                        <Link to="/upload" state={{ patientId: patient.id }} className="btn btn-light text-primary fw-bold shadow-sm d-flex align-items-center gap-2">
                            <i className="bi bi-plus-circle-fill"></i> New Scan
                        </Link>
                    </div>
                </div>
                <div className="card-body bg-light border-bottom">
                    <div className="row text-center text-md-start">
                        <div className="col-md-3 border-end">
                            <small className="text-muted fw-bold text-uppercase">Age</small>
                            <p className="fw-bold fs-5 mb-0">{patient.age} Years</p>
                        </div>
                        <div className="col-md-3 border-end">
                            <small className="text-muted fw-bold text-uppercase">Gender</small>
                            <p className="fw-bold fs-5 mb-0">{patient.gender}</p>
                        </div>
                        <div className="col-md-3">
                            <small className="text-muted fw-bold text-uppercase">Total Scans</small>
                            <p className="fw-bold fs-5 mb-0">{scans.length} Records</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History List */}
            <h4 className="fw-bold mb-3"><i className="bi bi-clock-history me-2 text-primary"></i>Longitudinal History</h4>

            <div className="list-group shadow-sm mb-5">
                {scans.length === 0 ? (
                    <div className="list-group-item text-center py-5 text-muted">
                        No scans recorded for this patient.
                    </div>
                ) : (
                    scans.map((scan) => (
                        <div key={scan.id} className="list-group-item list-group-item-action p-4 border-start-0 border-end-0">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <div className={`rounded p-3 d-flex align-items-center justify-content-center ${scan.anomaly_detected ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`} style={{ width: 60, height: 60 }}>
                                        <i className={`bi ${scan.anomaly_detected ? 'bi-exclamation-triangle-fill' : 'bi-file-medical-fill'} fs-4`}></i>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <h5 className="fw-bold mb-1">{scan.scan_type}</h5>
                                    <small className="text-muted">
                                        <i className="bi bi-calendar-event me-1"></i> {new Date(scan.scan_date).toLocaleDateString()}
                                    </small>
                                </div>

                                <div className="col text-end">
                                    {scan.cnn_change_percentage !== null && (
                                        <div className="mb-1">
                                            <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.7rem' }}>Progression</small>
                                            <span className={`fw-bold fs-5 ${scan.anomaly_detected ? 'text-danger' : 'text-dark'}`}>
                                                {scan.cnn_change_percentage}%
                                            </span>
                                            {scan.anomaly_detected && <span className="badge bg-danger ms-2">RISK</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="col-auto">
                                    <Link to={`/analyze/${scan.id}`} className="btn btn-outline-primary rounded-circle p-2">
                                        <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientDetails;
