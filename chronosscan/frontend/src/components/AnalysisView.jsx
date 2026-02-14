import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import ReactCompareImage from 'react-compare-image';

const AnalysisView = () => {
    const { scanId } = useParams();
    const [scanData, setScanData] = useState(null);
    const [prevScanData, setPrevScanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScanDetails = async () => {
            try {
                const response = await api.get(`/upload-scan/${scanId}`);
                setScanData(response.data.current);
                setPrevScanData(response.data.previous);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching scan:", error);
                setError("Failed to load analysis. Please try again.");
                setLoading(false);
            }
        };
        fetchScanDetails();
    }, [scanId]);

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/400x400?text=No+Data';
        return `http://localhost:5000/${path}`;
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="container mt-5">
            <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Analysis Failed</h4>
                <p>{error}</p>
                <hr />
                <button onClick={() => window.location.reload()} className="btn btn-outline-danger">Retry</button>
            </div>
        </div>
    );

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => window.history.back()} className="btn btn-light rounded-circle">
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="fw-bold mb-0">Scan Analysis <span className="badge bg-light text-dark border">#{scanId}</span></h2>
                        <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i> {new Date(scanData.scan_date).toLocaleDateString()} &bull; {scanData.scan_type}
                        </small>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                        <i className="bi bi-download"></i> Export
                    </button>
                    <button className="btn btn-primary d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill"></i> Approve
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* Left Column: Visual Analysis */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-lg bg-dark text-white mb-4 overflow-hidden">
                        <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center">
                            <span className="fw-bold"><i className="bi bi-images me-2"></i>Longitudinal Comparison</span>
                            <small className="text-muted">Drag slider to compare</small>
                        </div>
                        <div className="card-body p-0 position-relative bg-black" style={{ minHeight: '400px' }}>
                            {prevScanData ? (
                                <ReactCompareImage
                                    leftImage={getImageUrl(prevScanData.scan_path)}
                                    rightImage={getImageUrl(scanData.scan_path)}
                                    sliderLineColor="#0d6efd"
                                    sliderLineWidth={2}
                                />
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-muted">
                                    <img src={getImageUrl(scanData.scan_path)} className="img-fluid opacity-75" style={{ maxHeight: '400px' }} alt="Current Scan" />
                                    <p className="mt-3">Baseline Scan (No previous history)</p>
                                </div>
                            )}

                            {prevScanData && (
                                <>
                                    <span className="badge bg-dark bg-opacity-75 border border-secondary position-absolute top-0 start-0 m-3">
                                        PREV: {new Date(prevScanData.scan_date).toLocaleDateString()}
                                    </span>
                                    <span className="badge bg-primary bg-opacity-75 border border-primary position-absolute top-0 end-0 m-3">
                                        CURR: {new Date(scanData.scan_date).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {scanData.heatmap_path && (
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white fw-bold">
                                <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>Anomaly Heatmap
                            </div>
                            <div className="card-body text-center bg-light">
                                <img src={getImageUrl(scanData.heatmap_path)} className="img-fluid rounded" style={{ maxHeight: '300px', mixBlendMode: 'multiply' }} alt="Heatmap" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Clinical Report */}
                <div className="col-lg-5">
                    <div className="row g-3 mb-4">
                        <div className="col-6">
                            <div className={`card h-100 ${scanData.anomaly_detected ? 'bg-danger bg-opacity-10 border-danger' : 'bg-success bg-opacity-10 border-success'}`}>
                                <div className="card-body">
                                    <h6 className={`card-subtitle mb-2 text-uppercase fw-bold ${scanData.anomaly_detected ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.75rem' }}>Status</h6>
                                    <h3 className={`card-title fw-bold mb-0 ${scanData.anomaly_detected ? 'text-danger' : 'text-success'}`}>
                                        {scanData.anomaly_detected ? 'Anomaly Detected' : 'Normal'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card h-100 border-light shadow-sm">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Change</h6>
                                    <div className="d-flex align-items-baseline gap-2">
                                        <h3 className="card-title fw-bold mb-0 text-dark">{scanData.cnn_change_percentage || 0}%</h3>
                                        <small className="text-muted">structural diff</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-lg h-100">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <span className="fw-bold"><i className="bi bi-file-medical-fill me-2"></i>Clinical Summary</span>
                            <span className="badge bg-white text-primary">AI Generated</span>
                        </div>
                        <div className="card-body overflow-auto" style={{ maxHeight: '500px' }}>
                            {scanData.report_text ? (
                                <div style={{ whiteSpace: 'pre-line' }}>
                                    {scanData.report_text.split('\n').map((line, i) => (
                                        <p key={i} className={`mb-1 ${line.trim().startsWith('-') ? 'ps-3' : ''}`}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    <div className="spinner-border text-secondary mb-3" role="status"></div>
                                    <p>Generating clinical text...</p>
                                </div>
                            )}
                        </div>
                        <div className="card-footer text-muted small text-center bg-light">
                            Verify with clinical findings.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisView;
