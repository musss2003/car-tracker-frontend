import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useNavigate } from 'react-router-dom'; // Correct import from react-router-dom
import { useAuth } from './contexts/useAuth.js'; // Context for user authentication
import { ToastContainer } from 'react-toastify'; // Component to display toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Ensure CSS is imported for proper styling
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute.js";
import axios from 'axios';


// Axios interceptor setup
axios.interceptors.response.use(
  response => response,
  async error => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
              const res = await axios.post('/api/token/refresh', {}, { withCredentials: true });
              axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.accessToken;
              return axios(originalRequest);
          } catch (refreshError) {
              console.error('Unable to refresh token:', refreshError);
              return Promise.reject(refreshError);
          }
      }
      return Promise.reject(error);
  }
);

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
            <Route exact path='/dashboard' element={<Dashboard />} />
            <Route exact path='/settings' element={<Settings />} />
          </Route>
        </Routes>
    </>
  );
}

export default App;
