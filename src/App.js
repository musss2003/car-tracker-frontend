import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom'; // Correct import from react-router-dom
import { ToastContainer } from 'react-toastify'; // Component to display toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Ensure CSS is imported for proper styling
import Home from './components/Home';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute.js";
import DashboardPage from './pages/DashboardPage.js';
import DashboardCore from './containers/DashboardCore/DashboardCore.js';
import UserData from './containers/UserData/UserData.js';
import CarsPage from './pages/CarsPage.js';
import CustomerList from './containers/Customer/CustomerList/CustomerList.js';
import RentalList from './containers/Rental/RentalList/RentalList.js';

function App() {
  return (
    <>
      <ToastContainer position='bottom-right' />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route exact path='/' element={<ProtectedRoute />}>
          <Route exact path='/dashboard' element={<DashboardPage children={<DashboardCore />} />} />
          <Route exact path='/profile' element={<UserData />} />
          <Route exact path='/cars' element={<CarsPage />} />
          <Route exact path="/rentals" element={<RentalList />} />
          <Route exact path="/customers" element={<CustomerList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
