import React from 'react';
import { Link } from 'react-router-dom';

// Example Icons from Heroicons (https://heroicons.com/)
// Import appropriate icons for your links
import { ChartBarIcon, UserIcon, TruckIcon, NewspaperIcon } from '@heroicons/react/solid';

function Navbar() {
    return (
        <nav className="fixed inset-x-0 bottom-0 bg-gray-800 text-white md:relative md:inset-x-auto md:top-0 z-10">
            <div className='flex flex-col md:flex-row md:justify-between'>
                <div className='hidden md:flex'>
                    <Link to="/" className="flex items-center hover:text-gray-300 md:flex-row md:ml-8">
                        <span className="hidden md:flex">GradeTracker</span>
                    </Link>
                </div>
                <div className='flex justify-around md:justify-end items-center p-4'>
                    <Link to="/dashboard" className="flex flex-row items-center hover:text-gray-300 md:flex-row md:ml-8">
                        <ChartBarIcon className="w-6 h-6 md:hidden" />
                        <span className="hidden md:inline">Dashboard</span>
                    </Link>
                    <Link to="/rentals" className="flex items-center hover:text-gray-300 md:flex-row md:ml-8">
                        <NewspaperIcon className="w-6 h-6 md:hidden" />
                        <span className="hidden md:inline">Rente</span>
                    </Link>
                    <Link to="/cars" className="flex items-center hover:text-gray-300 md:flex-row md:ml-8 md:mr-6">
                    <TruckIcon  className="w-6 h-6 md:hidden" />
                        <span className="hidden md:inline">Auta</span>
                    </Link>
                    <Link to="/profile" className="flex items-center hover:text-gray-300 md:flex-row md:ml-8 md:mr-6">
                        <UserIcon className="w-6 h-6 md:hidden" />
                        <span className="hidden md:inline">Profil</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

