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
}

export const UserContext = createContext<AuthContextType | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

// Mock data for development mode
const MOCK_USER: User = {
  username: 'testuser',
  email: 'testuser@example.com',
  id: '12345',
  role: UserRole.USER,
};

const UserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isDevelopment = false; // import.meta.env.MODE === 'development';
  
  const checkSession = useCallback(async () => {
    if (isDevelopment) {
      console.warn('Development Mode: Mock session data loaded.');
      setUser(MOCK_USER);
      setIsReady(true);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/session-check`,
        {
          method: 'GET',
          credentials: 'include',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error('Session not found');

      const data = await response.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, [isDevelopment]);

  useEffect(() => {
    checkSession();
  }, [location.pathname, checkSession]);

  const loginUser = async (username: string, password: string) => {
    if (isDevelopment) {
      console.warn('Development Mode: Mock login.');
      setUser(MOCK_USER);
      toast.success('Logged in as ' + MOCK_USER.username);
      return;
    }

    try {
      const res = await loginAPI(username, password);
      setUser(res.data);
      navigate('/');
    } catch {
      toast.error('Login failed');
    }
  };

  const logout = async () => {
    if (isDevelopment) {
      console.warn('Development Mode: Mock logout.');
      setUser(null);
      toast.success('Logged out.');
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      setUser(null);
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const registerUser = async (
    email: string,
    username: string,
    password: string
  ) => {
    if (isDevelopment) {
      console.warn('Development Mode: Mock registration.');
      setUser(MOCK_USER);
      toast.success('Registered as ' + MOCK_USER.username);
      return;
    }

    try {
      const res = await registerAPI(email, username, password);
      setUser(res.data);
      navigate('/');
    } catch {
      toast.error('Registration failed');
    }
  };

  const isLoggedIn = () => user !== null;

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
      }}
    >
      {isReady ? children : <p>Loading...</p>}
    </UserContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(UserContext);
  if (!context) throw new Error('useAuth must be used within a UserProvider');
  return context;
};

export default UserProvider;
