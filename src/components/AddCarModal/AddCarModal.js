import React, { useState } from 'react';

const AddCarModal = ({ onClose, onAdd }) => {
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [color, setColor] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [chassisNumber, setChassisNumber] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

    const handleSave = () => {
        const newCar = { 
            make, 
            model, 
            year, 
            color, 
            license_plate: licensePlate, 
            chassis_number: chassisNumber,
            price_per_day: pricePerDay,
            profilePhotoUrl
        };
        onAdd(newCar);
        onClose();
    };

    const popularManufacturers = [
        'VOLKSWAGEN', 'TOYOTA', 'FORD', 'RENAULT', 'PEUGEOT', 
        'MERCEDES-BENZ', 'BMW', 'AUDI', 'SKODA', 'FIAT', 
        'OPEL', 'HYUNDAI', 'NISSAN', 'CITROEN', 'SEAT', 
        'KIA', 'VOLVO', 'DACIA', 'SUZUKI', 'CHEVROLET'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Dodaj auto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700">Marka</label>
                        <select 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={make} 
                            onChange={(e) => setMake(e.target.value)}
                        >
                            <option value="">Odaberi marku</option>
                            {popularManufacturers.map(manufacturer => (
                                <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                            ))}
                        </select>
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
                        <label className="block text-gray-700">Godina</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={year} 
                            onChange={(e) => setYear(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Boja</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Registacija</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={licensePlate} 
                            onChange={(e) => setLicensePlate(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Broj šasije</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={chassisNumber} 
                            onChange={(e) => setChassisNumber(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Cijena po danu</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={pricePerDay} 
                            onChange={(e) => setPricePerDay(e.target.value)} 
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Slika URL</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded" 
                            value={profilePhotoUrl} 
                            onChange={(e) => setProfilePhotoUrl(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>Otkaži</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>Spremi</button>
                </div>
            </div>
        </div>
    );
};

export default AddCarModal;
