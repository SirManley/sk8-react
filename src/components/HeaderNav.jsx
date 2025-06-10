// src/components/HeaderNav.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HeaderNav({ setSelectedGroup }) {
  return (
    <header className="bg-gray-800 text-white text-center py-4">
      <h1 className="text-5xl font-bold mb-0">SK8 or Die Workshop</h1>
      <p className="header-subtitle">One man’s collection of skate artifacts</p>

      <nav>
        <ul className="flex justify-center space-x-4">
          <li>  <Link to="/" onClick={() => setSelectedGroup(null)}>Home</Link> </li>
          <li>  <Link to="/skateboards" onClick={() => setSelectedGroup("Skateboards")}>Skateboards</Link>  </li>
          <li>  <Link to="/wheels" onClick={() => setSelectedGroup("Wheels")}>Wheels</Link>  </li>
          <li>  <Link to="/trucks" onClick={() => setSelectedGroup("Trucks")}>Trucks</Link>  </li>
          <li>  <Link to="/accessories" onClick={() => setSelectedGroup("Accessories")}>Accessories</Link>  </li>
          <li>  <Link to="/apparel" onClick={() => setSelectedGroup("Apparel")}>Apparel</Link>  </li>
          <li>  <Link to="/memorabilia" onClick={() => setSelectedGroup("Memorabilia")}>Memorabilia</Link>  </li>
        </ul>
      </nav>
    </header>
  );
}
