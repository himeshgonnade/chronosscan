import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', icon: 'bi-grid-1x2-fill', path: '/' },
        { name: 'Patients', icon: 'bi-people-fill', path: '/patients' },
        { name: 'Upload Scan', icon: 'bi-cloud-upload-fill', path: '/upload' },
        { name: 'Reports', icon: 'bi-file-earmark-text-fill', path: '/reports' },
        { name: 'Settings', icon: 'bi-gear-fill', path: '/settings' },
    ];

    return (
        <aside className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none border-bottom w-100 pb-3 border-secondary">
                <div className="bg-primary rounded p-2 me-2 d-flex align-items-center justify-content-center">
                    <i className="bi bi-activity fs-4"></i>
                </div>
                <span className="fs-4 fw-bold">ChronosScan</span>
            </a>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                {navItems.map((item) => (
                    <li className="nav-item mb-1" key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link text-white d-flex align-items-center gap-3 ${isActive ? 'active bg-primary' : ''}`
                            }
                        >
                            <i className={`${item.icon} fs-5`}></i>
                            {item.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <hr />
            <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                    <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-2" style={{ width: 32, height: 32 }}>
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <strong>Dr. Wilson</strong>
                </a>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                    <li><a className="dropdown-item" href="#">Profile</a></li>
                    <li><a className="dropdown-item" href="#">Settings</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#">Sign out</a></li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
