import React, { useEffect, useState } from 'react';
import CarCard from '../containers/CarCard/CarCard.js';
import { getCars, updateCar, deleteCar, addCar } from '../services/carService.js';
import AddCarModal from '../components/Car/AddCarModal/AddCarModal.js';
import ConfirmationModal from '../components/UtilsComponent/ConfirmationModal/ConfirmationModal.js';
import { toast } from "react-toastify";

const CarsPage = () => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState(null);
    const [showAddCarModal, setShowAddCarModal] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const data = await getCars();
                setCars(data);
            } catch (error) {
                console.error('Error fetching cars:', error);
                setError(error.message);
            }
        };

        fetchCars();
    }, []);

    const handleEditCar = async (updatedCar) => {
        try {
            const data = await updateCar(updatedCar._id, updatedCar);
            setCars(cars.map(car => (car._id === updatedCar._id ? data : car)));
        } catch (error) {
            console.error('Error updating car:', error);
            setError(error.message);
        }
    };

    const handleDeleteCar = (car) => {
        setCarToDelete(car);
        setIsConfirmationModalOpen(true);
    };

    const confirmDeleteCar = async () => {
        try {
            await deleteCar(carToDelete?._id);
            try {
                const data = await getCars();
                setCars(data);
            } catch (error) {
                console.error('Error fetching cars:', error);
                setError(error.message);
            }
            setIsConfirmationModalOpen(false);
            toast.success(carToDelete?.make + ' ' + carToDelete?.model + ' uspješno obrisan');
        } catch (error) {
            console.error('Error deleting customer:', error);
            setError('Error deleting customer');
        }
    };


    const cancelDeleteCustomer = () => {
        setIsConfirmationModalOpen(false);
        setCarToDelete(null);
    };

    const handleAddCar = async (newCar) => {
        try {
            const data = await addCar(newCar);
            setCars([...cars, data]);
        } catch (error) {
            console.error('Error adding car:', error);
            setError(error.message);
        }
    };

    return (
        <div className="cars-page p-6 text-center">
            <h1 className="text-3xl font-bold mb-6">LISTA AUTA</h1>
            {error && <p className="text-red-500">{error}</p>}
            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mb-4"
                onClick={() => setShowAddCarModal(true)}
            >
                Dodaj auto
            </button>
            <div className="car-list flex flex-wrap justify-center">
                {cars.map(car => (
                    <CarCard key={car._id} car={car} onEdit={handleEditCar} onDelete={() => handleDeleteCar(car)} />
                ))}
            </div>

            {showAddCarModal && <AddCarModal onClose={() => setShowAddCarModal(false)} onAdd={handleAddCar} />}

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                message={`Da li ste sigurni da želite izbrisati ${carToDelete?.make} ${carToDelete?.model}?`}
                onConfirm={confirmDeleteCar}
                onCancel={cancelDeleteCustomer}
            />
        </div>
    );
}

export default CarsPage;
