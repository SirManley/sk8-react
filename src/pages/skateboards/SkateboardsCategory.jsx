// src/pages/skateboards/SkateboardsCategory.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function SkateboardsCategory() {
  const { category } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchByCategory() {
      const q = query(
        collection(db, 'images'),
        where('category', '==', category)
      );
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchByCategory();
  }, [category]);

  return (
    <div>
      <h2 className="text-2xl mb-4">
        {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map(item => (
          <img
            key={item.id}
            src={item.thumbnailUrl}
            alt={item.name}
            className="object-cover w-full"
          />
        ))}
      </div>
    </div>
  );
}
