import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UserIcon, TruckIcon, ClipboardListIcon } from '@heroicons/react/solid';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <nav
            className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        >
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-link">
                        RENT A CAR
                    </Link>
                    <button onClick={toggleSidebar} className="sidebar-button" aria-label="Toggle sidebar">
                        {isOpen ? (
                            <span className="text-white">✖</span> // Cross icon when opened
                        ) : (
                            <span className="text-white">☰</span> // Hamburger icon
                        )}
                    </button>
                </div>
                <div className="sidebar-nav">
                    <NavLink to="/dashboard" icon={<ChartBarIcon className="nav-icon" />} label="Dashboard" />
                    <NavLink to="/cars" icon={<TruckIcon className="nav-icon" />} label="Auta" />
                    <NavLink to="/contracts" icon={<ClipboardListIcon className="nav-icon" />} label="Ugovori" />
                    <NavLink to="/profile" icon={<UserIcon className="nav-icon" />} label="Profil" />
                </div>
            </div>
        </nav>
    );
};

// Reusable NavLink component
const NavLink = ({ to, icon, label }) => (
    <Link to={to} className="nav-link">
        <div className="nav-icon">{icon}</div>
        <span>{label}</span>
    </Link>
);

export default Sidebar;