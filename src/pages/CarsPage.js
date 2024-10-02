// src/pages/CarsPage.js
import React from 'react';
import CarList from '../components/Car/CarList';

const CarsPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Cars List</h1>
            <CarList />
        </div>
    );
};

export default CarsPage;
