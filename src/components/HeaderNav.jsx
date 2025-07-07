import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function HeaderNav({ setSelectedGroup }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSearch(false);
    }
  };

  return (
    <header className="bg-gray-800 text-white text-center py-4 relative">
      <h1 className="text-5xl font-bold mb-0">SK8 or Die Workshop</h1>
      <p className="header-subtitle">One man’s collection of skate artifacts</p>

      <nav>
        <ul className="flex justify-center space-x-4 items-center">
          <li><Link to="/" onClick={() => setSelectedGroup(null)}>Home</Link></li>
          <li><Link to="/skateboards" onClick={() => setSelectedGroup("Skateboards")}>Skateboards</Link></li>
          <li><Link to="/wheels" onClick={() => setSelectedGroup("Wheels")}>Wheels</Link></li>
          <li><Link to="/trucks" onClick={() => setSelectedGroup("Trucks")}>Trucks</Link></li>
          <li><Link to="/accessories" onClick={() => setSelectedGroup("Accessories")}>Accessories</Link></li>
          <li><Link to="/apparel" onClick={() => setSelectedGroup("Apparel")}>Apparel</Link></li>
          <li><Link to="/memorabilia" onClick={() => setSelectedGroup("Memorabilia")}>Memorabilia</Link></li>
          <li><Link to="/protective" onClick={() => setSelectedGroup("Protective")}>Protective</Link></li>
          <li><Link to="/admin" onClick={() => setSelectedGroup(null)}>Admin</Link></li>
          <li>
            <button
              onClick={() => setShowSearch(prev => !prev)}
              className="text-white hover:text-gray-300 focus:outline-none"
              title="Search"
            >
              <FaSearch size={18} />
            </button>
          </li>
        </ul>
      </nav>

      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="mt-2 flex justify-center">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search the collection…"
            className="px-3 py-1 rounded text-black max-w-xs w-full"
          />
        </form>
      )}
    </header>
  );
}

