import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import ScanUpload from './components/ScanUpload';
import AnalysisView from './components/AnalysisView';
import Dashboard from './components/Dashboard'; // New
import { Reports, Settings } from './components/Placeholders'; // New
import Login from './components/Login'; // New

function App() {
    // Initialize state directly from localStorage to prevent flash
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('token');
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />

                {isAuthenticated ? (
                    <Route path="/*" element={
                        <Layout onLogout={handleLogout}>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/patients" element={<PatientList />} />
                                <Route path="/patient/:id" element={<PatientDetails />} />
                                <Route path="/upload" element={<ScanUpload />} />
                                <Route path="/analyze/:scanId" element={<AnalysisView />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </Layout>
                    } />
                ) : (
                    <Route path="*" element={<Navigate to="/login" replace />} />
                )}
            </Routes>
        </Router>
    );
}

export default App;
