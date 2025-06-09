// src/pages/skateboards/SkateboardsHome.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SkateboardsHome() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const snap = await getDocs(collection(db, 'images'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFeatured(all.find(item => item.name === 'Main-Wall'));
    }
    fetchFeatured();
  }, []);

  if (!featured) return <p>Loading featured board…</p>;

  return (
    <img
      src={featured.thumbnailUrl}
      alt={featured.name}
      className="thumbnail object-cover"
    />
  );
}
