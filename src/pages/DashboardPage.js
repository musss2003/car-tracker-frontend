import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../services/carService';

// Example of Dashboard Cards
import { ContractsContext } from '../contexts/ContractsContext';
import { TruckIcon, UserIcon, CurrencyDollarIcon, ClipboardListIcon } from '@heroicons/react/solid';
import { getCustomers } from '../services/customerService';
import { getTotalRevenue } from '../services/contractService';

function DashboardPage() {
    const { contracts } = useContext(ContractsContext);
    const [numberOfCars, setNumberOfCars] = useState(0); // State for number of cars
    const [numberOfCustomers, setNumberOfCustomers] = useState(0); // State for number of customers
    const [totalRevenue, setTotalRevenue] = useState(0); // State for total revenue

    useEffect(() => {
        const fetchNumberOfCars = async () => {
            const data = await getCars();
            setNumberOfCars(data.length); // Store the length of the cars array
        };


        const fetchNumberOfCustomers = async () => {
            const data = await getCustomers();
            setNumberOfCustomers(data.length); // Store the length of the customers array
        };

        const fetchTotalRevenue = async () => {
            const data = await getTotalRevenue();
            setTotalRevenue(data.totalRevenue);
        }


        fetchTotalRevenue(); // Call the fetch function
        fetchNumberOfCustomers(); // Call the fetch function
        fetchNumberOfCars(); // Call the fetch function
    }, []); // Run once when the component mounts

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Komandna tabla</h1>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Active Contracts */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <ClipboardListIcon className="w-10 h-10 text-blue-500 mr-4" />
                    <div>
                        <h2 className="text-xl font-bold">{contracts.length}</h2>
                        <p className="text-gray-500">Active Contracts</p>
                    </div>
                </div>

                {/* Available Cars */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <TruckIcon className="w-10 h-10 text-green-500 mr-4" />
                    <div>
                        <h2 className="text-xl font-bold">{numberOfCars}</h2> {/* Use the state variable */}
                        <p className="text-gray-500">Available Cars</p>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <UserIcon className="w-10 h-10 text-purple-500 mr-4" />
                    <div>
                        <h2 className="text-xl font-bold">{numberOfCustomers}</h2>
                        <p className="text-gray-500">Total Customers</p>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                    <CurrencyDollarIcon className="w-10 h-10 text-yellow-500 mr-4" />
                    <div>
                        <h2 className="text-xl font-bold">${totalRevenue}</h2>
                        <p className="text-gray-500">Total Revenue</p>
                    </div>
                </div>
            </div>

            {/* Links to Details */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/contracts" className="block bg-gray-200 p-4 rounded-lg text-lg font-semibold hover:bg-gray-300">
                        Manage Contracts
                    </Link>
                    <Link to="/customers" className="block bg-gray-200 p-4 rounded-lg text-lg font-semibold hover:bg-gray-300">
                        View Customers
                    </Link>
                    <Link to="/cars" className="block bg-gray-200 p-4 rounded-lg text-lg font-semibold hover:bg-gray-300">
                        Available Cars
                    </Link>
                    <Link to="/rentals" className="block bg-gray-200 p-4 rounded-lg text-lg font-semibold hover:bg-gray-300">
                        Rental Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
