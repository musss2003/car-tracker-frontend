import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAPI, registerAPI } from '../services/authService';
import { getAuthHeaders } from '../utils/getAuthHeaders';
import { User, UserRole } from '../types/User';

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
      {isReady ? children : <div>Loading authentication...</div>}
    </UserContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(UserContext);
  if (!context) throw new Error('useAuth must be used within a UserProvider');
  return context;
};

export default UserProvider;
