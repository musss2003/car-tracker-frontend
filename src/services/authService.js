import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/auth/';

export const loginAPI = async (username, password) => {
    try {
        const data = await axios.post(API_URL + "login", {
            username: username,
            password: password,
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const registerAPI = async (
    email,
    username,
    password,
    role
) => {
    try {
        const data = await axios.post(API_URL + "register", {
            email: email,
            username: username,
            password: password,
            role: role
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const refreshTokenAPI = async (accessToken) => {
    try {
        const response = await axios.post(API_URL + 'refresh-token', {
            accessToken
        });
        return response.accessToken; // This will contain `valid` and potentially `decoded` data
    } catch (error) {
        console.error('Error verifying token:', error.response.data);
        return null;
    }
};



