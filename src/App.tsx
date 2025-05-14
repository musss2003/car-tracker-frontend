import React, { useState } from 'react';
import { useAuth } from './contexts/useAuth';
import useScreenSize from './hooks/useScreenSize';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Sidebar from './components/Sidebar/Sidebar';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function App() {
  const { isLoggedIn } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isSmallScreen = useScreenSize('(max-width: 768px)');

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
          <Sidebar
            isOpen={isSidebarOpen}
            isSmallScreen={isSmallScreen}
            toggleSidebar={toggleSidebar}
          />
        )}

        {/* Main Content Area */}
        <main
          role="main"
          aria-label="Main Content Area"
          className={`main-content ${
            isLoggedIn() && !isSmallScreen && isSidebarOpen
              ? 'with-sidebar-open'
              : isLoggedIn() && !isSmallScreen && !isSidebarOpen
                ? 'with-sidebar-closed'
                : ''
          }`}
          data-testid="main-content"
        >
          {/* Page Content */}
          <div className="page-content">
            <AppRoutes />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
