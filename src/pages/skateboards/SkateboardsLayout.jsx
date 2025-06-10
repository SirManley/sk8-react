// src/pages/skateboards/SkateboardsLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const categories = [
  'old-school',
  'new-school',
  'shaped',
  'freestyle',
  'mike-mcgill',
  'tony-hawk',
  'complete-collection'
];

export default function SkateboardsLayout() {
  return (
    <div className="skateboards-page flex min-h-screen">
      {/* Sidebar on the left */}


      {/* Main content area: always render the active child here */}
      <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
