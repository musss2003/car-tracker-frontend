import React from 'react';
import "./UpcomingAssignments.css"

const UpcomingAssignments = ({ assignments }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Upcoming Assignments</h2>
            {assignments.map((assignment, index) => (
                <div key={index} className="p-4 bg-gray-100 rounded-lg mb-3 hover:bg-gray-200 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.name} - Due {assignment.dueDate}</h3>
                    <p className="text-gray-800 mb-1">Course: {assignment.course}</p>
                    <p className="text-gray-800 font-semibold">Priority: <span className={`text-${assignment.priorityColor}-500`}>{assignment.priority}</span></p>
                </div>
            ))}
        </div>
    );
};

export default UpcomingAssignments;


