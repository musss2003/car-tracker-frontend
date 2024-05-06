import React, { createContext, useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { loginAPI, registerAPI } from "../services/authService";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_BASE_URL + "/api/auth/";

const UserContext = createContext({});

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Make a request to the session-check endpoint
                const response = await axios.get(API_URL + 'session-check', { withCredentials: true });
                if (response.status === 200) {
                    setUser({ username: response.data.username, email: response.data.email });
                } else {
                    setUser(null);  // Reset user state if not authenticated
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setUser(null);  // Reset user state on error
            } finally {
                setIsReady(true);  // Ensure readiness is set irrespective of auth status
            }
        };

        checkSession();
    }, []);

    const registerUser = async (email, username, password, role) => {
        try {
            const res = await registerAPI(email, username, password, role);
            if (res.status === 200) {
                setUser({ username: res.data.username, email: res.data.email });
                toast.success("Registration Successful!");
                navigate("/");
            }
        } catch (error) {
            toast.warning("Server error occurred");
        }
    };

    const loginUser = async (username, password) => {
        try {
            const res = await loginAPI(username, password);
            if (res.status === 200) {
                setUser({ username: res.data.username, email: res.data.email });
                toast.success("Login Success!");
                navigate("/");
            }
        } catch (error) {
            toast.warning("Server error occurred");
        }
    };

    const isLoggedIn = () => {
        return !!user;
    };

    const logout = async () => {
        try {
            await axios.post(API_URL + 'logout', {}, { withCredentials: true });
            toast.success("Logout Successful!");
        } catch (error) {
            toast.warning("Logout failed!");
        } finally {
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <UserContext.Provider
            value={{ loginUser, user, logout, isLoggedIn, registerUser }}
        >
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
