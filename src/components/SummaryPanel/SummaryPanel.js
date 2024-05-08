import React, { useState } from 'react';

const SummaryPanel = ({ user }) => {
    const [currentTerm, setCurrentTerm] = useState('Fall 2024');
    const terms = ['Fall 2024', 'Spring 2024', 'Fall 2023']; // Example terms
    
    return (
        <div className="bg-white shadow-lg rounded-lg p-5">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-700">{user.gpa.current}/4.0</h1>
                <p className="text-sm text-gray-500">Up from {user.gpa.lastSemester}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(user.gpa.current / 4) * 100}%` }}></div>
                </div>
            </div>
            <div className="mb-4">
                <label htmlFor="term-select" className="block text-sm font-medium text-gray-700">Select Term:</label>
                <select 
                    id="term-select"
                    value={currentTerm}
                    onChange={(e) => setCurrentTerm(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {terms.map(term => (
                        <option key={term} value={term}>{term}</option>
                    ))}
                </select>
            </div>
            <div>
                <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${user.status.toLowerCase() === 'enrolled' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {user.status}
                </span>
            </div>
        </div>
    );
};

export default SummaryPanel;
