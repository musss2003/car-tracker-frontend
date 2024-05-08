import React from 'react';
import "./CoursesOverview.css";

const CoursesOverview = ({ courses }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Current Courses</h2>
            {courses.map((course, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded-lg mb-2">
                    <h3 className="text-md font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-gray-800">Current Grade: {course.grade}</p>
                    <p className="text-gray-800">Next Assignment: {course.nextAssignment}</p>
                </div>
            ))}
        </div>
    );
};

export default CoursesOverview;


