import React, { useState } from "react";

import { useAuth } from "./contexts/useAuth";
import useScreenSize from "./hooks/useScreenSize";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import AppHeader from "./components/AppHeader/AppHeader";
import { AppRoutes } from "./routes/AppRoutes";
import './App.css'


function App() {
  const { isLoggedIn } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isSmallScreen = useScreenSize("(max-width: 768px)");

  React.useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <ToastContainer position="bottom-right" />

        {isLoggedIn() && (
          <Sidebar isOpen={isSidebarOpen} isSmallScreen={isSmallScreen} toggleSidebar={toggleSidebar} />
        )}

        <main
          className={`main-content ${isLoggedIn() && !isSmallScreen && isSidebarOpen ? "with-sidebar-open" : isLoggedIn() && !isSmallScreen && !isSidebarOpen ? "with-sidebar-closed" : ""}`}
        >
          {isLoggedIn() && !isSmallScreen && <Navbar />}

          {isSmallScreen && (
            <AppHeader isLoggedIn={isLoggedIn()} toggleSidebar={toggleSidebar} isSmallScreen={isSmallScreen} />
          )}

          <div className="page-content">
            <AppRoutes /> {/* much cleaner! */}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;