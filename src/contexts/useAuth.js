import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from "react-toastify";
import { loginAPI, registerAPI } from "../services/authService";
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthHeaders } from '../utils/getAuthHeaders';

const API_URL = process.env.REACT_APP_API_BASE_URL + "/api/auth/";

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const navigate = useNavigate();
    const location = useLocation(); // Detect route changes

    const checkSession = useCallback(async () => {
        try {
            const response = await fetch(API_URL + 'session-check', {
                method: 'GET',
                credentials: 'include',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json();
            setUser({ username: data.username, email: data.email, id: data.id });

        } catch (error) {
            console.error('Error message:', error.message);
            setUser(null);
            navigate('/login'); // Redirect only if authentication fails
        } finally {
            setIsReady(true);
        }
    }, [navigate]); // Keep dependencies minimal to avoid unnecessary re-renders

    useEffect(() => {
        checkSession(); // Run on route change
    }, [location.pathname]); 

    const registerUser = async (email, username, password) => {
        try {
            const res = await registerAPI(email, username, password);
            if (res.status === 201) {
                setUser({ username: res.data.username, email: res.data.email, id: res.data.id });
                toast.success("Registered user: " + res.data.username);
                navigate("/");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Server error occurred";
            toast.warning(errorMessage);
        }
    };

    const loginUser = async (username, password) => {
        try {
            const res = await loginAPI(username, password);
            if (res.status === 200) {
                setUser({ username: res.data.username, email: res.data.email, id: res.data.id });
                toast.success("Welcome " + username);
                navigate("/");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Server error occurred";
            toast.warning(errorMessage);
        }
    };

    const isLoggedIn = () => user !== null;

    const logout = async () => {
        try {
            const response = await fetch(API_URL + 'logout', {
                method: 'POST',
                credentials: 'include',
                headers: getAuthHeaders(),
                body: JSON.stringify({}), 
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            toast.success("Logout Successful!");
        } catch (error) {
            toast.warning("Logout failed!");
        } finally {
            setUser(null); // Ensure user state is cleared first
            navigate('/login'); 
        }
    };

    return (
        <UserContext.Provider value={{ loginUser, user, setUser, logout, isLoggedIn, registerUser }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
