import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import GradeInputForm from './components/GradeInputForm';
import GradeDetails from './components/GradeDetails';
import Settings from './components/Settings'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/grade-input" element={<GradeInputForm />} />
        <Route path="/grade-details/:subject" element={<GradeDetails />} />
        <Route path="/settings" element={<Settings />} />

      </Routes>
    </Router>
  );
}

export default App;
