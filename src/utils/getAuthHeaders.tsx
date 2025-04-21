export const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Set Authorization header with token
    };
};