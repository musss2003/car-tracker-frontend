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
                    const response = await axios.get(API_URL + 'session-check', { withCredentials: true });
                    if (response.status === 200) {
                        setUser({ username: response.data.username, email: response.data.email, id: response.data.id });
                        console.log("Authenticated!");
                    } else {
                        throw new Error('Failed to authenticate');
                    }
                
            } catch (error) {
                if (error.response) {
                    console.error('Error data:', error.response.data);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                setUser(null);
            } finally {
                setIsReady(true);
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
                setUser({ username: res.data.username, email: res.data.email, id: res.data.id });
                toast.success("Welcome " + username);
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
            // Redirect to login page or perform other cleanup
            window.location.href = '/';
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