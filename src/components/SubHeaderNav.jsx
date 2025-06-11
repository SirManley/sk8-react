// src/components/SubHeaderNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { groupsData } from '../data/groupsData';

export default function SubHeaderNav() {
  const location = useLocation();

  // Determine active group based on the current URL
  const activeGroup = Object.keys(groupsData).find((group) =>
    location.pathname.startsWith(`/${group.toLowerCase()}`)
  );

  const subGroups = groupsData[activeGroup] || [];

  return (
    <nav className="sub-header">
      <ul className="flex justify-center items-center h-full space-x-4">
        {subGroups.map((cat) => {
        const slug = cat.toLowerCase().replace(/\s+/g, '-');  // Create URL-safe slug
        const path = `/${activeGroup.toLowerCase()}/${slug}`;
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
