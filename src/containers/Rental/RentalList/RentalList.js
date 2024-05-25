import React, { useState, useEffect } from 'react';
import { deleteRental, getRentals, updateRental } from '../../../services/rentalService.js';
import { toast } from "react-toastify";
import RentalCard from '../RentalCard/RentalCard.js';
import AddRentalForm from '../../../components/Rental/AddRentalForm/AddRentalForm.js';
import RentalDetailsModal from '../../../components/Rental/RentalDetailsModals/RentalDetailsModal.js';
import EditRentalForm from '../../../components/Rental/EditRentalForm/EditRentalForm.js';
import ConfirmationModal from '../../../components/UtilsComponent/ConfirmationModal/ConfirmationModal.js';

const RentalList = () => {
    const [rentals, setRentals] = useState([]);
    const [selectedRental, setSelectedRental] = useState(null);
    const [editRental, setEditRental] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [rentalToDelete, setRentalToDelete] = useState(null);

    const [searchParams, setSearchParams] = useState({
        customerName: '',
        carModel: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rentalsPerPage = 10;

    const fetchRentals = async (page = currentPage) => {
        try {
            const response = await getRentals({
                ...searchParams,
                page: page,
                limit: rentalsPerPage
            });
            setRentals(response.rentals);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            toast.error('Error fetching rentals');
        }
    };

    useEffect(() => {
        fetchRentals();
    }, [searchParams, currentPage]);

    const handleAddRental = (newRental) => {
        setRentals([...rentals, newRental]);
    };

    const handleUpdateRental = async (updatedRental, rentalId) => {
        try {
            const response = await updateRental(rentalId, updatedRental);
            if (updatedRental) {
                setRentals(rentals.map(rental => (rental._id === response._id ? response : rental)));
            } else {
                setRentals(rentals.filter(rental => rental._id !== rentalId));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearchChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
        setCurrentPage(1); // Reset to first page on new search
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleViewDetails = (rental) => {
        setSelectedRental(rental);
    };

    const handleCloseDetails = () => {
        setSelectedRental(null);
    };

    const handleEditRental = (rental) => {
        setEditRental(rental);
    };

    const handleDeleteRental = (rental) => {
        setRentalToDelete(rental);
        setIsConfirmationModalOpen(true);
    };

    const confirmDeleteRental = async () => {
        try {
            await deleteRental(rentalToDelete._id);
            fetchRentals(); // Refresh the list after deleting a customer
            setIsConfirmationModalOpen(false);
            toast.success(rentalToDelete._id +' deleted successfully');
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    const cancelDeleteRental= () => {
        setIsConfirmationModalOpen(false);
        setRentalToDelete(null);
    };

    return (
        <div className="rental-list p-6 text-center mb-10">
            <h1 className="text-3xl font-bold mb-6">Rental List</h1>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-6"
                onClick={() => setShowAddForm(true)}
            >
                Add Rental
            </button>
            <div className="flex flex-wrap justify-between mb-4">
                <input
                    type="text"
                    name="customerName"
                    placeholder="Search by customer name"
                    value={searchParams.customerName}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded mb-2 w-full md:w-1/5"
                />
                <input
                    type="text"
                    name="carModel"
                    placeholder="Search by car model"
                    value={searchParams.carModel}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded mb-2 w-full md:w-1/5"
                />
                <select name="status" value={searchParams.status} onChange={handleSearchChange} className="p-2 border border-gray-300 rounded mb-2 w-full md:w-1/5">
                    <option value="">Select status</option>
                    <option value="booked">Booked</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
                <input
                    type="date"
                    name="startDate"
                    value={searchParams.startDate}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded mb-2 w-full md:w-1/5"
                />
                <input
                    type="date"
                    name="endDate"
                    value={searchParams.endDate}
                    onChange={handleSearchChange}
                    className="p-2 border border-gray-300 rounded mb-2 w-full md:w-1/5"
                />
            </div>
            <div className="flex flex-wrap justify-center">
                {rentals.map(rental => (
                    <RentalCard
                        key={rental._id}
                        rental={rental}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditRental}
                        onDelete={handleDeleteRental}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
            {showAddForm && (
                <AddRentalForm onClose={() => {setShowAddForm(false); fetchRentals()}} onAdd={handleAddRental} />
            )}
            {selectedRental && (
                <RentalDetailsModal rental={selectedRental} onClose={handleCloseDetails} />
            )}
            {editRental && (
                <EditRentalForm rental={editRental} onClose={() => setEditRental(null)} onUpdate={handleUpdateRental} />
            )}
             <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                message={`Are you sure you want to delete: Rental for ${rentalToDelete?.customer_id.name}?`}
                onConfirm={confirmDeleteRental}
                onCancel={cancelDeleteRental}
            />
        </div>
    );
};

export default RentalList;