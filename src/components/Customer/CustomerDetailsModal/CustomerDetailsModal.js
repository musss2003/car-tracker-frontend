import React, { useState } from 'react';
import { CameraIcon } from '@heroicons/react/outline';
import FullScreenImageModal from '../../UtilsComponent/FullScreenImageModal/FullScreenImageModal';


const CustomerDetailsModal = ({ customer, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-full overflow-y-auto">
                    <h2 className="text-2xl font-semibold mb-4">{customer.name}</h2>
                    <div className="space-y-3">
                        <p className="text-gray-700"><strong>Email:</strong> {customer.email}</p>
                        <p className="text-gray-700"><strong>Phone:</strong> {customer.phone_number}</p>
                        <p className="text-gray-700"><strong>Address:</strong> {customer.address}</p>
                        <p className="text-gray-700"><strong>Driver License Number:</strong> {customer.driver_license_number}</p>
                        <p className="text-gray-700"><strong>Passport Number:</strong> {customer.passport_number}</p>
                        {customer.passportPhotoUrl && (
                            <div className="my-4 flex items-center space-x-4">
                                <CameraIcon className="w-6 h-6 text-gray-500 cursor-pointer" onClick={() => handleImageClick(customer.passportPhotoUrl)} />
                                <span className="text-gray-700">Passport Photo</span>
                            </div>
                        )}
                        {customer.drivingLicensePhotoUrl && (
                            <div className="my-4 flex items-center space-x-4">
                                <CameraIcon className="w-6 h-6 text-gray-500 cursor-pointer" onClick={() => handleImageClick(customer.drivingLicensePhotoUrl)} />
                                <span className="text-gray-700">Driving License Photo</span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>

            {selectedImage && <FullScreenImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </>
    );
};

export default CustomerDetailsModal;
