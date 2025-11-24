import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import UserProvider from '../features/auth/hooks/useAuth';
import { ThemeProvider } from '@/shared/providers/ThemeProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Router>
      <UserProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </UserProvider>
    </Router>
  </React.StrictMode>
);
