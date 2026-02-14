import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, User } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                <Activity className="h-6 w-6" />
                ChronosScan
            </Link>
            <div className="flex items-center gap-4">
                <Link to="/" className="text-gray-600 hover:text-blue-600">Patients</Link>
                <Link to="/upload" className="text-gray-600 hover:text-blue-600">New Scan</Link>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="h-5 w-5" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
