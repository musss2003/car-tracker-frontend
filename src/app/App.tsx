import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import useScreenSize from '../shared/hooks/useScreenSize';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ModernSidebar from '../shared/components/layout/ModernSidebar/ModernSidebar';
import { AppRoutes } from './routes/AppRoutes';
import '../shared/utils/themeManager'; // Initialize theme manager
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
          <ModernSidebar
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
