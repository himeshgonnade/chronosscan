import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/patient');
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Patient Directory</h2>
                    <p className="text-secondary">Manage patient records and view scan history.</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2">
                    <i className="bi bi-person-plus-fill"></i>
                    Add Patient
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {patients.map(patient => (
                        <div className="col-12 col-md-6 col-lg-4" key={patient.id}>
                            <Link to={`/patient/${patient.id}`} className="text-decoration-none text-dark">
                                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-start gap-4">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 60, height: 60 }}>
                                                <i className="bi bi-person fs-3"></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h5 className="card-title fw-bold mb-1">{patient.name}</h5>
                                                <p className="card-text text-muted small mb-3">ID: {patient.id}</p>

                                                <div className="d-flex gap-3 text-secondary small">
                                                    <span className="d-flex align-items-center gap-1">
                                                        <i className="bi bi-calendar"></i> {patient.age} yrs
                                                    </span>
                                                    <span className="d-flex align-items-center gap-1">
                                                        <i className="bi bi-gender-ambiguous"></i> {patient.gender}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-primary opacity-50">
                                                <i className="bi bi-chevron-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {!loading && patients.length === 0 && (
                <div className="alert alert-light border text-center py-5" role="alert">
                    <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                        <i className="bi bi-people fs-3"></i>
                    </div>
                    <h5>No patients found</h5>
                    <p className="mb-0">Get started by adding a new patient.</p>
                </div>
            )}
        </div>
    );
};

export default PatientList;
