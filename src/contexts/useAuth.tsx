// ✅ useAuth.tsx or UserContext.tsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { loginAPI, registerAPI } from "../services/authService";
import { getAuthHeaders } from "../utils/getAuthHeaders";
import { User, UserRole } from "../types/User";

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

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/session-check`,
        {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }

      const data = await response.json();
      setUser({
        username: data.username,
        email: data.email,
        id: data.id,
        role: data.role,
      });
    } catch (error) {
      console.error("Session error:", error);
      setUser(null);
      navigate("/login");
    } finally {
      setIsReady(true);
    }
  }, [navigate]);

  useEffect(() => {
    checkSession();
  }, [location.pathname]);

  const registerUser = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      const res = await registerAPI(email, username, password);
      if (res.status === 201) {
        setUser({
          username: res.data.username,
          email: res.data.email,
          id: res.data.id,
          role: res.data.role,
        });
        toast.success("Registered user: " + res.data.username);
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message || "Server error occurred";
      toast.warning(errorMessage);
    }
  };

  const loginUser = async (username: string, password: string) => {
    try {
      const res = await loginAPI(username, password);
      if (res.status === 200) {
        setUser({
          username: res.data.username,
          email: res.data.email,
          id: res.data.id,
          role: res.data.role,
        });
        toast.success("Welcome " + username);
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message || "Server error occurred";
      toast.warning(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      toast.success("Logout successful");
    } catch {
      toast.warning("Logout failed");
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const isLoggedIn = () => user !== null;

  // ✅ Make sure we are returning JSX!
  return (
    <UserContext.Provider
      value={{
        loginUser,
        user,
        setUser,
        logout,
        isLoggedIn,
        registerUser,
        isReady,
      }}
    >
      {isReady ? children : null}
    </UserContext.Provider>
  );
};

// ✅ Hook
export const useAuth = (): AuthContextType => {
  const context = React.useContext(UserContext);
  if (!context) throw new Error("useAuth must be used within a UserProvider");
  return context;
};
