import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import useScreenSize from '../shared/hooks/useScreenSize';
import ErrorBoundary from '../shared/components/feedback/ErrorBoundary/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ModernSidebar from '../shared/components/layout/ModernSidebar/ModernSidebar';
import { AppRoutes } from './routes/AppRoutes';
import { socketService } from '../shared/services/socketService';
import './App.css';
import { Toaster } from '@/shared/components/ui/sonner';

function App() {
  const { isLoggedIn, user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isSmallScreen = useScreenSize('(max-width: 768px)');

  // Connect to WebSocket when logged in for real-time presence
  useEffect(() => {
    if (isLoggedIn() && user?.id) {
      // Connect to Socket.IO and mark user as online
      socketService.connect(user.id);
    } else {
      // Disconnect when logged out
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (!isLoggedIn()) {
        socketService.disconnect();
      }
    };
  }, [isLoggedIn, user?.id]);

  React.useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Toaster />
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
