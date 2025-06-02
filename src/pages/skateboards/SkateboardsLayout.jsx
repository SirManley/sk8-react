// src/pages/skateboards/SkateboardsLayout.jsx
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

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
  const { category } = useParams();
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    // Only fetch featured when no category is selected
    if (!category) {
      async function fetchFeatured() {
        const snap = await getDocs(collection(db, 'images'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFeatured(all.find(item => item.name === 'Main-Wall'));
      }
      fetchFeatured();
    }
  }, [category]);

  return (
    <div className="skateboards-page flex min-h-screen">

      {/* Sidebar on the left */}
      <aside className="w-48 bg-gray-800 text-white p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/skateboards"
              end={!category}
              className={({ isActive }) =>
                isActive
                  ? 'block px-2 py-1 bg-gray-600 rounded'
                  : 'block px-2 py-1 hover:bg-gray-700 rounded'
              }
            >
              Featured
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

      {/* Main content area */}
    <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
        {!category ? (
          featured ? (
            <img
              src={featured.thumbnailUrl}
              alt={featured.name}
              className="thumbnail object-cover"
            />
          ) : (
            <p>Loading featured board…</p>
          )
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
