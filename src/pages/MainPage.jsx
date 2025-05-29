// File: src/pages/MainPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function MainPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchItems() {
      const snapshot = await getDocs(collection(db, 'images'));
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchItems();
  }, []);

  // Find the single item named “SK8C”
  const featured = items.find(item => item.name === 'SK8C');

  return (
<div className="min-h-screen bg-gray-100 main-page">
      <header>
        <h1>SK8 or Die Workshop</h1>
        <div className="subtitle">One man's collection of skate artifacts</div>
        <nav>
          <ul>
            <li><Link to="/">Skateboards</Link></li>
            <li><Link to="/">Wheels</Link></li>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/">Trucks</Link></li>
            <li><Link to="/">Accessories</Link></li>
            <li><Link to="/">Soft Goods</Link></li>
            <li><Link to="/">Stickers</Link></li>

            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </nav>
      </header>


      <main className="max-w-7xl mx-auto p-4">
        {featured ? (
          <img
            src={featured.thumbnailUrl}
            alt={featured.name}
            className="thumbnail block object-cover mx-auto"
          />
        ) : (
          <p className="text-center py-8">Loading featured item…</p>
        )}
      </main>
    </div>
  );
}