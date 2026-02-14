import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import ScanUpload from './components/ScanUpload';
import AnalysisView from './components/AnalysisView';

function App() {
    return (
        <Router>
            <div className="flex bg-slate-50 min-h-screen text-slate-800">
                <SidebarWrapper />
            </div>
        </Router>
    );
}

// Wrapper to use useLocation or just standard Layout wrapper around Routes?
// Actually, Layout has Sidebar which has NavLinks. It should be inside Router.
const SidebarWrapper = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<PatientList />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patient/:id" element={<PatientDetails />} />
                <Route path="/upload" element={<ScanUpload />} />
                <Route path="/analyze/:scanId" element={<AnalysisView />} />
            </Routes>
        </Layout>
    )
}

export default App;
