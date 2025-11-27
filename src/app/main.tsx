import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import UserProvider from '../features/auth/hooks/useAuth';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';
import { SidebarProvider } from '@/shared/components/ui/sidebar';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <UserProvider>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </UserProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
