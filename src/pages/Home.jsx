// File: src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
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
<main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
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
  );
}
