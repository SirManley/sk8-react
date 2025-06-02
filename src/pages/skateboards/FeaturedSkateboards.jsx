// src/pages/skateboards/SkateboardsLayout.jsx
import { NavLink, Outlet } from 'react-router-dom';

const categories = [
  'featured',
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
      <aside className="w-1/4 bg-gray-800 text-white p-4">
        <ul className="space-y-2">
          {categories.map(cat => {
            const path = cat === 'featured' ? '' : cat;
            const label =
              cat === 'featured'
                ? 'Featured'
                : cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return (
              <li key={cat}>
                <NavLink
                  to={path}
                  end={cat === 'featured'}
                  className={({ isActive }) =>
                    isActive
                      ? 'block px-3 py-1 bg-gray-600 rounded'
                      : 'block px-3 py-1 hover:bg-gray-700 rounded'
                  }
                >
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main content area: centers Outlet horizontally at top */}
      <main className="flex-1 p-6 flex justify-center items-start overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}
