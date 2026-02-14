import React from 'react';

const Dashboard = () => {
    const [stats, setStats] = React.useState({
        patients: 0,
        scans: 0,
        reports: 0,
        anomalies: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/dashboard/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-5 text-center">Loading dashboard...</div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4 fw-bold">Dashboard</h2>
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="card text-white bg-primary h-100">
                        <div className="card-body">
                            <h5 className="card-title"><i className="bi bi-people-fill me-2"></i>Total Patients</h5>
                            <p className="card-text display-4">{stats.patients}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body">
                            <h5 className="card-title"><i className="bi bi-cloud-check-fill me-2"></i>Scans Processed</h5>
                            <p className="card-text display-4">{stats.scans}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning h-100">
                        <div className="card-body">
                            <h5 className="card-title"><i className="bi bi-exclamation-triangle-fill me-2"></i>Anomalies Detected</h5>
                            <p className="card-text display-4">{stats.anomalies}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info h-100">
                        <div className="card-body">
                            <h5 className="card-title"><i className="bi bi-file-earmark-text-fill me-2"></i>Reports Generated</h5>
                            <p className="card-text display-4">{stats.reports}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
