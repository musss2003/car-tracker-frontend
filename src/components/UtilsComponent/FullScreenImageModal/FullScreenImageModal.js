import React from 'react';

const FullScreenImageModal = ({ imageUrl, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto">
                <img src={imageUrl} alt="Full View" className="w-full h-auto rounded" />
                <div className="flex justify-end mt-4">
                    <a href={imageUrl} download className="bg-green-500 text-white px-4 py-2 rounded mr-2">Vidi cijelu</a>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default FullScreenImageModal;
