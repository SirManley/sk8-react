// src/components/HeaderNav.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HeaderNav() {
  return (
    <header>
      {/* Later we’ll style this via your CSS or Tailwind */}
      <h1>SK8 or Die Workshop</h1>
      <div className="subtitle">One man’s collection of skate artifacts</div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/skateboards">Skateboards</Link></li>
          <li><Link to="/wheels">Wheels</Link></li>
          <li><Link to="/trucks">Trucks</Link></li>
          <li><Link to="/accessories">Accessories</Link></li>
          <li><Link to="/softgoods">Soft Goods</Link></li>
          <li><Link to="/stickers">Stickers</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
      </nav>
    </header>
  );
}
