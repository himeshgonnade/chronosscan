import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, onLogout }) => {
    return (
        <div className="container-fluid p-0">
            <div className="row g-0">
                {/* Sidebar Column */}
                <div className="col-auto">
                    <div className="col-auto">
                        <Sidebar onLogout={onLogout} />
                    </div>
                </div>

                {/* Main Content Column */}
                <div className="col" style={{ marginLeft: '280px', minHeight: '100vh', backgroundColor: '#f0f3f5' }}>
                    {/* Header */}
                    <header className="py-3 px-4 border-bottom bg-white d-flex justify-content-between align-items-center sticky-top shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                        <div className="input-group" style={{ maxWidth: '400px' }}>
                            <span className="input-group-text bg-light border-end-0 text-muted">
                                <i className="bi bi-search"></i>
                            </span>
                            <input type="text" className="form-control bg-light border-start-0" placeholder="Search patients, MRIs, CTs..." />
                        </div>

                        <div className="d-flex align-items-center gap-4">
                            <button className="btn btn-light position-relative rounded-circle p-2 text-secondary hover-primary">
                                <i className="bi bi-bell fs-5"></i>
                                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                    <span className="visually-hidden">New alerts</span>
                                </span>
                            </button>

                            <div className="d-flex align-items-center gap-3 border-start ps-4">
                                <div className="text-end d-none d-sm-block">
                                    <p className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Admin</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>System Administrator</p>
                                </div>
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center border border-primary border-opacity-25" style={{ width: 42, height: 42 }}>
                                    <i className="bi bi-person-badge fs-5"></i>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="p-4" style={{ backgroundColor: '#f0f3f5' }}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;
