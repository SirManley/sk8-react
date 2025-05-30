// File: src/pages/Skateboards.jsx
import React, { useEffect, useState } from 'react';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Skateboards() {
  const [items, setItems] = useState([]);

  // 1. Fetch all images from Firestore
  useEffect(() => {
    async function fetchItems() {
      const snapshot = await getDocs(collection(db, 'images'));
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    }
    fetchItems();
  }, []);

  // 2. Find the one named "Main-wall"
  const featured = items.find(item => item.name === 'Main-Wall');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col main-page skateboards-page">
      {/* 3. HeaderNav is our shared header/nav component */}
      <HeaderNav />

      {/* 4. Sub-navigation for skateboard categories */}
      <nav className="bg-white py-4">
        <ul className="flex justify-center space-x-6 text-lg">
          <li><Link to="/skateboards/old-school">Old School</Link></li>
          <li><Link to="/skateboards/new-school">New School</Link></li>
          <li><Link to="/skateboards/shaped">Shaped</Link></li>
          <li><Link to="/skateboards/freestyle">Freestyle</Link></li>
        </ul>
      </nav>

      {/* 5. Main content: the featured image, centered */}
      <main className="flex-grow max-w-7xl mx-auto p-4">
        {featured ? (
          <img
            src={featured.thumbnailUrl}
            alt={featured.name}
            className="thumbnail object-cover"
          />
        ) : (
          <p className="text-center py-8">Loading featured board…</p>
        )}
      </main>

      {/* 6. Footer is our shared footer component */}
      <Footer />
    </div>
  );
}
