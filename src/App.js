import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Settings from './components/Settings'; 
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />  {/* This places the Navbar at the top of all pages */}
      <div className="mt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
