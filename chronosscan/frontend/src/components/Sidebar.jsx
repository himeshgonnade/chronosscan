import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({ onLogout }) => {
    const handleLogoutClick = (e) => {
        e.preventDefault();
        console.log("Sidebar logout clicked");
        if (onLogout) onLogout();
    };
    const navItems = [
        { name: 'Dashboard', icon: 'bi-grid-1x2-fill', path: '/' },
        { name: 'Patients', icon: 'bi-people-fill', path: '/patients' },
        { name: 'Upload Scan', icon: 'bi-cloud-upload-fill', path: '/upload' },
        { name: 'Reports', icon: 'bi-file-earmark-text-fill', path: '/reports' },
        { name: 'Settings', icon: 'bi-gear-fill', path: '/settings' },
    ];

    return (
        <aside className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow-lg" style={{ width: '280px', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1000, background: 'linear-gradient(180deg, #1a202c 0%, #2d3748 100%)' }}>
            <a href="/" className="d-flex align-items-center mb-4 text-white text-decoration-none border-bottom border-secondary pb-3 px-2">
                <div className="bg-primary rounded px-2 py-1 me-3 shadow-sm d-flex align-items-center justify-content-center">
                    <i className="bi bi-activity fs-4 text-white"></i>
                </div>
                <div className="d-flex flex-column">
                    <span className="fs-5 fw-bold tracking-tight">ChronosScan</span>
                    <span className="text-white-50" style={{ fontSize: '0.7rem' }}>AI-Powered Radiology</span>
                </div>
            </a>

            <ul className="nav nav-pills flex-column mb-auto gap-1">
                {navItems.map((item) => (
                    <li className="nav-item" key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link text-white d-flex align-items-center gap-3 px-3 py-2 rounded-3 transition-all ${isActive ? 'active bg-primary shadow' : 'hover-bg-white-10 text-opacity-75'}`
                            }
                        >
                            <i className={`${item.icon} fs-5`}></i>
                            <span className="fw-medium">{item.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="mt-auto pt-3 border-top border-secondary">
                <div className="dropdown">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle p-2 rounded hover-bg-white-10" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                        <div className="rounded-circle bg-success d-flex justify-content-center align-items-center me-3 shadow-sm" style={{ width: 38, height: 38 }}>
                            <i className="bi bi-shield-lock-fill text-white small"></i>
                        </div>
                        <div className="d-flex flex-column">
                            <strong className="small">Admin User</strong>
                            <span className="text-white-50" style={{ fontSize: '0.7rem' }}>admin@hospital.com</span>
                        </div>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                        <li><NavLink className="dropdown-item" to="/settings">Profile</NavLink></li>
                        <li><NavLink className="dropdown-item" to="/settings">Settings</NavLink></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item text-danger" onClick={handleLogoutClick}>Sign out</button></li>
                    </ul>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
