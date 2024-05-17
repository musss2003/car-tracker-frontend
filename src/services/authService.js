const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/auth/';

export const loginAPI = async (username, password) => {
    try {
        const response = await fetch(API_URL + "login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include credentials to send cookies
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`Error logging in: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            status: response.status,
            data
        };
    } catch (error) {
        console.log(error);
    }
};

export const registerAPI = async (email, username, password) => {
    try {
        const response = await fetch(API_URL + "register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`Error registering: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            status: response.status,
            data
        };
    } catch (error) {
        console.log(error);
    }
};
