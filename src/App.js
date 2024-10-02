import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import Home from './components/Home';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute.js";
import DashboardPage from './pages/DashboardPage.js';
import UserData from './containers/UserData/UserData.js';
import CarsPage from './pages/CarsPage.js';
import CustomerList from './containers/Customer/CustomerList/CustomerList.js';
import RentalList from './containers/Rental/RentalList/RentalList.js';
import { ContractsProvider } from './contexts/ContractsContext.js';
import Sidebar from './components/Sidebar'; // Import the sidebar

function App() {
  return (
    <ContractsProvider>
      <ToastContainer position='bottom-right' />
      <div className="flex"> {/* Flexbox layout to hold sidebar and content */}
        <Sidebar /> {/* Sidebar component */}
        <div className="flex-1 ml-64 p-6"> {/* Main content area */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<UserData />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/rentals" element={<RentalList />} />
              <Route path="/customers" element={<CustomerList />} />
            </Route>
          </Routes>
        </div>
      </div>
    </ContractsProvider>
  );
}

export default App;
