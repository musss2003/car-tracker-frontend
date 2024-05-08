import React from 'react';

const DashboardPage = ({ children }) => {
    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );
};

export default DashboardPage;
