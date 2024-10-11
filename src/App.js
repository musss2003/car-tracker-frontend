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

function App() {
    const [isSidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
    };

    return (
        <ContractsProvider>
            <ToastContainer position='bottom-right' />
            <div className="flex min-h-screen"> {/* Ensure the flex container takes full height */}
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : ''}`} style={{ marginLeft: isSidebarOpen ? '250px' : '0' }}>
                    {/* Hamburger icon for mobile */}
                    {!isSidebarOpen && ( // Only show the hamburger icon when sidebar is closed
                        <button onClick={toggleSidebar} className="md:hidden p-2 text-white bg-gray-800 fixed z-20 top-4 left-4 rounded" aria-label="Toggle sidebar">
                            ☰ {/* Hamburger Icon */}
                        </button>
                    )}

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
