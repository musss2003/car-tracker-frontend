import React, { useState } from 'react';
import './SummaryPanel.css'; // Assuming you have a CSS file for styles

const SummaryPanel = ({ user }) => {
    const [currentTerm, setCurrentTerm] = useState('Fall 2024');

    const terms = ['Fall 2024', 'Spring 2024', 'Fall 2023']; // Example terms

    return (
        <div className="summary-panel">
            <div className="gpa-overview">
                <h1>{user.gpa.current}/4.0</h1>
                <p>Up from {user.gpa.lastSemester}</p>
                <div className="progress-bar">
                    <div 
                        className="progress-bar-filled"
                        style={{ width: `${(user.gpa.current / 4) * 100}%` }}
                    ></div>
                </div>
            </div>
            <div className="term-selector">
                <label htmlFor="term-select">Select Term: </label>
                <select 
                    id="term-select"
                    value={currentTerm}
                    onChange={(e) => setCurrentTerm(e.target.value)}
                >
                    {terms.map(term => (
                        <option key={term} value={term}>{term}</option>
                    ))}
                </select>
            </div>
            <div className="academic-status">
                <span className={`status-indicator ${user.status.toLowerCase()}`}>
                    {user.status}
                </span>
            </div>
        </div>
    );
};

export default SummaryPanel;
