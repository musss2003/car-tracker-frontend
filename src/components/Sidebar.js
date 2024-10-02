import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UserIcon, TruckIcon, NewspaperIcon, GlobeIcon } from '@heroicons/react/solid';

const Sidebar = () => {
    return (
        <nav className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-4 z-10">
            <div className="flex flex-col h-full">
                <div className="mb-8">
                    <Link to="/" className="flex items-center text-xl font-bold hover:text-gray-300">
                        RENT A CAR
                    </Link>
                </div>
                <div className="flex flex-col space-y-4">
                    <NavLink to="/dashboard" icon={<ChartBarIcon className="w-6 h-6" />} label="Dashboard" />
                    <NavLink to="/customers" icon={<GlobeIcon className="w-6 h-6" />} label="Gosti" />
                    <NavLink to="/rentals" icon={<NewspaperIcon className="w-6 h-6" />} label="Rente" />
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
