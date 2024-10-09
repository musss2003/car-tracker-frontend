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
                const accessToken = localStorage.getItem("accessToken");
                console.log("My accessToken: " + accessToken);

                const response = await fetch(API_URL + 'session-check', {
                    method: 'GET',
                    credentials: 'include', // Include credentials to send cookies
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to authenticate'); // Handle non-200 responses
                }

                const data = await response.json(); // Parse the JSON response
                setUser({ username: data.username, email: data.email, id: data.id });

            } catch (error) {
                // Handle the error appropriately
                console.error('Error message:', error.message);
                setUser(null);
            } finally {
                setIsReady(true);
            }
        };

        checkSession();
    }, []);

    const registerUser = async (email, username, password) => {
        try {
            const res = await registerAPI(email, username, password);
            if (res.status === 201) {

                setUser({ username: res.data.username, email: res.data.email, id: res.data.id });
                toast.success("Registered user: " + res.data.username);
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
            value={{ loginUser, user, setUser, logout, isLoggedIn, registerUser }}
        >
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);
