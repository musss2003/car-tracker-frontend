import React from 'react';
import './CoursesOverview.css'; // Basic CSS for styling

const CoursesOverview = ({ courses }) => {
    return (
        <div className="courses-overview">
            <h2>Current Courses</h2>
            {courses.map((course, index) => (
                <div key={index} className="course">
                    <h3>{course.name}</h3>
                    <p>Current Grade: {course.grade}</p>
                    <p>Next Assignment: {course.nextAssignment}</p>
                </div>
            ))}
        </div>
    );
};

export default CoursesOverview;

