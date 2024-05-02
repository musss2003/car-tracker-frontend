import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-4">Welcome to Grade Tracker</h1>
            <p className="text-xl text-center mb-8">Your simple solution to track and manage academic grades efficiently.</p>
            <div className="flex justify-center">
                <Link to="/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default Home;
