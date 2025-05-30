import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AdminPage from './pages/AdminPage';
import Skateboards from './pages/Skateboards';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/skateboards" element={<Skateboards />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
