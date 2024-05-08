import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./PerformanceGraphs.css"; // Ensure any specific styles needed are defined here

const PerformanceGraphs = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md w-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Grade Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="grade" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceGraphs;

