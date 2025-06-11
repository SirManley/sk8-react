// src/pages/wheels/WheelsLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

export default function WheelsLayout() {
  return (
    <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
      <Outlet />
    </main>
  );
}
