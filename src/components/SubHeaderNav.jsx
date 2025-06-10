// src/components/SubHeaderNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const categories = [
  'old-school',
  'new-school',
  'shaped',
  'freestyle',
  'mike-mcgill',
  'tony-hawk',
  'complete-collection'
];

export default function SubHeaderNav() {
  return (
    <nav className="sub-header">
<ul className="flex justify-center items-center h-full space-x-4">
  {categories.map((cat) => {
    const path = `/skateboards/${cat}`;
    const label = cat.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return (
      <li key={cat}>
        <NavLink
          to={path}
          className={({ isActive }) =>
            isActive
              ? 'text-white font-bold underline'
              : 'text-white hover:text-gray-300'
          }
        >
          {label}
        </NavLink>
      </li>
    );
  })}
</ul>

    </nav>
  );
}
