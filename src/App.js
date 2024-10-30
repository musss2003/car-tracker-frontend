import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute.js";
import DashboardPage from './pages/DashboardPage.js';
import UserData from './containers/UserData/UserData.js';
import CarsPage from './pages/CarsPage.js';
import { ContractsProvider } from './contexts/ContractsContext.js';
import ContractsPage from './pages/ContractsPage.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import './App.css'; // Import the CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

function App() {
    const [isSidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
    };

    return (
        <ContractsProvider>
            <ToastContainer position='bottom-right' />
            <div className="flex-container"> {/* Ensure the flex container takes full height */}
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <main className="main-content">
                    {/* Hamburger icon for mobile */}
                    <div className="top-bar">
                        <div className='first-row'>
                            <div className='logo'>
                                <FontAwesomeIcon icon={faCar} />
                                <span>RENT A CAR</span>
                            </div>
                            <button onClick={toggleSidebar} aria-label="Toggle sidebar">
                                ☰ Menu{/* Hamburger Icon */}
                            </button>
                        </div>
                        <div className='second-row'>
                            <h3>Looking for a vehicle? You’re at the right place.
                            </h3>
                        </div>
                        <div className='third-row-background'></div>
                        <div className='third-row'>
                            <button className='saving-button'>
                                SAVE 15%
                            </button>
                            <span className='ml-2'>
                                Discover Bosnia and Herzegowina with us
                            </span>
                            <button className='details-button'>
                                <span>More details</span>
                            </button>
                        </div>
                    </div>

                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/profile" element={<UserData />} />
                            <Route path="/cars" element={<CarsPage />} />
                            <Route path="/contracts" element={<ContractsPage />} />
                        </Route>
                    </Routes>
                </main>
            </div>
        </ContractsProvider>
    );
}

export default App;