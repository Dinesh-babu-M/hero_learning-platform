import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Routes>
       
      {/* <Route path="/" element={<Navigate to="/login" />} /> */}
      {/* <Route path="/login" element={<Navigate to="/login" />} /> */}

      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Navigate to="/" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
