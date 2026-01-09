import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAPI, registerAPI } from '../services/authService';
import { getAuthHeaders } from '../../../shared/utils/getAuthHeaders';
import { logError } from '../../../shared/utils/logger';
import { User, UserRole } from '../../users/types/user.types';

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
        // Log status for debugging without exposing sensitive details
        logError(`Session check failed (Status: ${response.status})`);
        throw new Error('Session check failed');
      }

      const data = await response.json();

      if (!data.authenticated) {
        throw new Error('Not authenticated');
      }

      // If backend returned a new access token, store it
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
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
      logError('Login error:', error);
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
      logError('Logout error:', error);
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
      toast.success(
        `Welcome, ${res.data.username}! Your account has been created.`
      );
      navigate('/');
    } catch (error: any) {
      logError('Registration error:', error);
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
      {isReady ? (
        children
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          {/* Main content */}
          <div className="relative z-10 w-full max-w-md mx-4">
            {/* Card */}
            <div className="relative bg-card border rounded-2xl shadow-lg p-8 sm:p-12">
              {/* Logo and branding */}
              <div className="text-center mb-8 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 11L6.5 6.5H17.5L19 11M7.5 16.5H9M15 16.5H16.5M6 13.5L7.5 11H16.5L18 13.5V18C18 18.5523 17.5523 19 17 19H16C15.4477 19 15 18.5523 15 18V17.5H9V18C9 18.5523 8.55228 19 8 19H7C6.44772 19 6 18.5523 6 18V13.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                  Car Tracker
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sistem za praćenje vozila
                </p>
              </div>

              {/* Spinner */}
              <div className="flex justify-center mb-8">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-3 border-muted rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-transparent border-t-primary rounded-full animate-spin"></div>
                </div>
              </div>

              {/* Loading text */}
              <div className="text-center mb-8 space-y-2">
                <p className="text-foreground font-medium">
                  Učitavanje autentifikacije...
                </p>
                <p className="text-muted-foreground text-sm">
                  Molimo sačekajte dok se verifikuju vaši podaci
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-progress"></div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border animate-slide-up delay-100">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    Sigurno praćenje vozila
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border animate-slide-up delay-200">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 10V3L4 14H11V21L20 10H13Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    Brza analiza i izvještaji
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border animate-slide-up delay-300">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    Napredna kontrola pristupa
                  </span>
                </div>
              </div>
            </div>

            {/* Footer text */}
            <p className="text-center text-muted-foreground text-xs mt-6">
              Powered by modern web technologies
            </p>
          </div>

          <style>{`
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes spin-reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            @keyframes fade-in {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-bounce-slow {
              animation: bounce-slow 3s ease-in-out infinite;
            }
            .animate-spin-reverse {
              animation: spin-reverse 1s linear infinite;
            }
            .animate-progress {
              animation: progress 2s ease-in-out infinite;
            }
            .animate-fade-in {
              animation: fade-in 0.6s ease-out;
            }
            .animate-slide-up {
              animation: slide-up 0.6s ease-out backwards;
            }
            .delay-100 { animation-delay: 100ms; }
            .delay-200 { animation-delay: 200ms; }
            .delay-300 { animation-delay: 300ms; }
            .delay-500 { animation-delay: 500ms; }
            .delay-1000 { animation-delay: 1000ms; }
          `}</style>
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
