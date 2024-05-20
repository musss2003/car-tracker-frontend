import React, { useState } from 'react';

const EditCarModal = ({ car, onClose, onEdit }) => {
    const [make, setMake] = useState(car.make || '');
    const [model, setModel] = useState(car.model || '');
    const [year, setYear] = useState(car.year || '');
    const [color, setColor] = useState(car.color || '');
    const [licensePlate, setLicensePlate] = useState(car.license_plate || '');
    const [chassisNumber, setChassisNumber] = useState(car.chassis_number || '');
    const [pricePerDay, setPricePerDay] = useState(car.price_per_day || '');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(car.profilePhotoUrl || '');

    const handleSave = () => {
        const updatedCar = { 
            ...car, 
            make, 
            model, 
            year, 
            color, 
            license_plate: licensePlate, 
            chassis_number: chassisNumber,
            price_per_day: pricePerDay,
            profilePhotoUrl
        };
        onEdit(updatedCar);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Edit Car</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700">Make</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={make} 
                            onChange={(e) => setMake(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Model</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={model} 
                            onChange={(e) => setModel(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Year</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={year} 
                            onChange={(e) => setYear(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Color</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">License Plate</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={licensePlate} 
                            onChange={(e) => setLicensePlate(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Chassis Number</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={chassisNumber} 
                            onChange={(e) => setChassisNumber(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Price Per Day</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={pricePerDay} 
                            onChange={(e) => setPricePerDay(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Profile Photo URL</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={profilePhotoUrl} 
                            onChange={(e) => setProfilePhotoUrl(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>Cancel</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditCarModal;
