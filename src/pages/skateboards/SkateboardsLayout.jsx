// src/pages/skateboards/SkateboardsLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ImageModal from '../../components/ImageModal';

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
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* Lightbox overlay */}
      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <div className="skateboards-page flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-4 border-r">
          <nav>
            <ul>
              {categories.map(cat => (
                <li key={cat} className="mb-2">
                  <NavLink
                    to={cat}
                    className={({ isActive }) =>
                      `block py-2 px-3 rounded hover:bg-gray-200 ${
                        isActive ? 'bg-gray-200 font-bold' : ''
                      }`
                    }
                  >
                    {cat.replace(/-/g, ' ')}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
          {/* Now each category page can call setSelectedItem(item) */}
          <Outlet context={{ setSelectedItem }} />
        </main>
      </div>
    </>
  );
}
