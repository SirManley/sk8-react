// src/pages/trucks/TrucksHome.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TrucksHome() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const snap = await getDocs(collection(db, 'images'));
      const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // make sure you upload a "Trucks-collage" item in Firestore
      setFeatured(all.find(item => item.name === 'Original Tony Hawk Claw'));
    }
    fetchFeatured();
  }, []);

  if (!featured)
    return <p className="text-center">Loading featured truck collage…</p>;

  return (
    <img
      src={featured.thumbnailUrl}
      alt={featured.name}
      className="thumbnail object-cover mx-auto"
      style={{ maxHeight: '80vh', width: 'auto' }}
    />
  );
}
