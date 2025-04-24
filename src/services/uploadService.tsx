import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/uploads/'; // Adjust based on your actual API URL

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    console.log(response.data.url);

    return response.data.url;
};