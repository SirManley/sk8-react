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
      <aside className="w-48 bg-gray-800 text-white p-4">
        <ul className="space-y-2">
          {/* “Skateboards Home” (index route) */}
          <li>
            <NavLink
              to="/skateboards"
              end
              className={({ isActive }) =>
                isActive
                  ? 'block px-2 py-1 bg-gray-600 rounded'
                  : 'block px-2 py-1 hover:bg-gray-700 rounded'
              }
            >
              Skateboards Home
            </NavLink>
          </li>

          {categories.map(cat => {
            const path = `/skateboards/${cat}`;
            const label = cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return (
              <li key={cat}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    isActive
                      ? 'block px-2 py-1 bg-gray-600 rounded'
                      : 'block px-2 py-1 hover:bg-gray-700 rounded'
                  }
                >
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main content area: always render the active child here */}
      <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
