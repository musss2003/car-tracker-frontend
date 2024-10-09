import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UserIcon, TruckIcon } from '@heroicons/react/solid';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <nav
            className={`fixed inset-y-0 left-0 bg-gray-800 text-white p-4 z-10 transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:block md:w-64`}
            style={{ width: '250px' }} // Set a fixed width for the sidebar
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center mb-8">
                    <Link to="/" className="flex items-center text-xl font-bold hover:text-gray-300">
                        RENT A CAR
                    </Link>
                    <button onClick={toggleSidebar} className="md:hidden ml-2 p-2 bg-gray-700 rounded" aria-label="Toggle sidebar">
                        {isOpen ? (
                            <span className="text-white">✖</span> // Cross icon when opened
                        ) : (
                            <span className="text-white">☰</span> // Hamburger icon
                        )}
                    </button>
                </div>
                <div className="flex flex-col space-y-4">
                    <NavLink to="/dashboard" icon={<ChartBarIcon className="w-6 h-6" />} label="Dashboard" />
                    <NavLink to="/cars" icon={<TruckIcon className="w-6 h-6" />} label="Auta" />
                    <NavLink to="/profile" icon={<UserIcon className="w-6 h-6" />} label="Profil" />
                </div>
            </div>
        </nav>
    );
};

// Reusable NavLink component
const NavLink = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center hover:text-gray-300">
        <div className="mr-4">{icon}</div>
        <span>{label}</span>
    </Link>
);

export default Sidebar;
