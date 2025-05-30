// src/pages/skateboards/SkateboardsLayout.jsx
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
    <div className="skateboards-page">
      <nav className="bg-white py-4 shadow">
        <ul className="flex flex-wrap justify-center space-x-4 text-lg">
          <li>
            <NavLink to="" end className={({isActive}) => isActive ? 'font-bold underline' : ''}>
              Featured
            </NavLink>
          </li>
          {categories.map(cat => (
            <li key={cat}>
              <NavLink to={cat} className={({isActive}) => isActive ? 'font-bold underline' : ''}>
                {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-page flex-grow max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
