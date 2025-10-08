import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAPI, registerAPI } from '../services/authService';
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { User, UserRole } from '../types/User';
import './AuthLoading.css';

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: () => boolean;
  isReady: boolean;
  refreshSession: () => Promise<void>;
}

export const UserContext = createContext<AuthContextType | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

const UserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/session-check`,
        {
          method: 'GET',
          credentials: 'include',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Session check failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.authenticated) {
        throw new Error('Not authenticated');
      }
      
      // If backend returned a new access token, store it
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        console.log('🔄 Access token refreshed successfully');
      }
      
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role
      });
      
    } catch (error: any) {
      console.log('Session check failed:', error.message);
      setUser(null);
      // Clear invalid access token
      localStorage.removeItem('accessToken');
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [location.pathname, checkSession]);

  const loginUser = async (username: string, password: string) => {
    try {
      const res = await loginAPI(username, password);
      
      // Store access token in localStorage
      if (res.data.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      
      setUser(res.data);
      toast.success(`Welcome back, ${res.data.username}!`);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      
      toast.success('Successfully logged out.');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed, but you have been logged out locally.');
    } finally {
      // Always clear local data regardless of server response
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/login');
    }
  };

  const registerUser = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      const res = await registerAPI(email, username, password);
      
      // Store access token in localStorage
      if ((res.data as any).accessToken) {
        localStorage.setItem('accessToken', (res.data as any).accessToken);
      }
      
      setUser(res.data);
      toast.success(`Welcome, ${res.data.username}! Your account has been created.`);
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  const isLoggedIn = () => user !== null;

  // Expose refresh session function for manual use
  const refreshSession = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logout,
        registerUser,
        isLoggedIn,
        isReady,
        refreshSession,
      }}
    >
      {isReady ? children : (
        <div className="auth-loading-overlay">
          <div className="auth-loading-container">
            <div className="auth-loading-header">
              <div className="auth-loading-logo">
                <svg className="auth-loading-car-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 11L6.5 6.5H17.5L19 11M7.5 16.5H9M15 16.5H16.5M6 13.5L7.5 11H16.5L18 13.5V18C18 18.5523 17.5523 19 17 19H16C15.4477 19 15 18.5523 15 18V17.5H9V18C9 18.5523 8.55228 19 8 19H7C6.44772 19 6 18.5523 6 18V13.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="auth-loading-brand">Car Tracker</h1>
              </div>
              <p className="auth-loading-subtitle">Sistem za praćenje vozila</p>
            </div>
            
            <div className="auth-loading-spinner-container">
              <div className="auth-loading-spinner"></div>
            </div>
            
            <div className="auth-loading-content">
              <div className="auth-loading-text">Učitavanje autentifikacije...</div>
              <div className="auth-loading-description">Molimo sačekajte dok se verifikuju vaši podaci</div>
            </div>
            
            <div className="auth-loading-features">
              <div className="auth-loading-feature">
                <svg className="auth-loading-feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Sigurno praćenje</span>
              </div>
              <div className="auth-loading-feature">
                <svg className="auth-loading-feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Brza analiza</span>
              </div>
              <div className="auth-loading-feature">
                <svg className="auth-loading-feature-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Upravljanje korisnicima</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(UserContext);
  if (!context) throw new Error('useAuth must be used within a UserProvider');
  return context;
};

export default UserProvider;
