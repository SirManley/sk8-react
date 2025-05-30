// File: src/pages/MainPage.jsx
import React, { useEffect, useState } from 'react';
import HeaderNav from '../components/HeaderNav';   // ← Make sure this path matches
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Footer from '../components/Footer';


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
      <HeaderNav />

      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto p-4">
        {featured ? (
        <img
          src={featured.thumbnailUrl}
          alt={featured.name}
          className="thumbnail object-cover"
          />
        ) : (
          <p className="text-center py-8">Loading featured item…</p>
        )}
      </main>

      <Footer />    {/* ← rendered here */}
      
    </div>
  );
}
