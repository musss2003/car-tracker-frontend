import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UserIcon, TruckIcon, ClipboardListIcon, UserCircleIcon } from '@heroicons/react/solid';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ isOpen, isSmallScreen, toggleSidebar }) => {
    // Reusable NavLink component
    const NavLink = ({ to, icon, label }) => (
        <Link onClick={toggleSidebar} to={to} className="nav-link">
            <div className="nav-icon">{icon}</div>
            <span>{label}</span>
        </Link>
    );

    return (
        <nav
            className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        >
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-link">
                        RENT A CAR
                    </Link>
                    {isOpen && isSmallScreen && 
                    <button onClick={toggleSidebar} className="sidebar-button" aria-label="Toggle sidebar">
                        ✖
                    </button>
                    }
                </div>
                <div className="sidebar-nav">
                    <NavLink to="/dashboard" icon={<ChartBarIcon className="nav-icon" />} label="Komandna tabela" />
                    <NavLink to="/cars" icon={<TruckIcon className="nav-icon" />} label="Auta" />
                    <NavLink to="/contracts" icon={<ClipboardListIcon className="nav-icon" />} label="Ugovori" />
                    <NavLink to="/customers" icon={<UserCircleIcon className="nav-icon" />} label="Korisnici" />
                    <NavLink to="/profile" icon={<UserIcon className="nav-icon" />} label="Profil" />
                </div>
            </div>
        </nav>
    );
};


export default Sidebar;