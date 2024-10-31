import React from 'react';

const ContractDetails = ({ contract, onEdit, onBack, onDelete, onDownload }) => {
    // Check if the contract is valid
    if (!contract) {
        return <div className="text-red-500">No contract details available.</div>;
    }

    return (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 shadow-lg rounded-lg w-11/12 max-w-md">
                <h2 className="text-2xl font-semibold mb-4">Contract Details</h2>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Customer Details</h3>
                    <p><strong>Customer:</strong> {contract.customer.name.toString()} - {contract.customer.passport_number.toString()}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Car Details</h3>
                    <p><strong>Car:</strong> {contract.car.model.toString()} - {contract.car.license_plate.toString()}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Rental Period</h3>
                    <p><strong>Start Date:</strong> {new Date(contract.rentalPeriod.startDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {new Date(contract.rentalPeriod.endDate).toLocaleDateString()}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Rental Price</h3>
                    <p><strong>Daily Rate:</strong> ${contract.rentalPrice.dailyRate.toFixed(2)}</p>
                    <p><strong>Total Amount:</strong> ${contract.rentalPrice.totalAmount.toFixed(2)}</p>
                </div>

                {/* <div className="mb-4">
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                    <p><strong>Payment Method:</strong> {contract.paymentDetails.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> {contract.paymentDetails.paymentStatus}</p>
                </div> */}

                {contract.additionalNotes && (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Additional Notes</h3>
                        <p>{contract.additionalNotes}</p>
                    </div>
                )}

                {contract.contractPhoto && (
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Contract Photo</h3>
                        <img 
                            src={contract.contractPhoto} 
                            alt="Contract" 
                            className="w-full h-auto rounded"
                        />
                    </div>
                )}

                <div className="flex justify-between mt-4">
                    <button 
                        onClick={onBack}
                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                    >
                        Back to Contracts
                    </button>
                    <button 
                        onClick={onEdit}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    >
                        Edit Contract
                    </button>
                    <button 
                        onClick={onDownload}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                        Download Contract
                    </button>
                    <button 
                        onClick={onDelete}
                        className="bg-red-500 text-white p-2 rounded hover:bg-gray-600 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractDetails;
