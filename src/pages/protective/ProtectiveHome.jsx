import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ProtectiveHome() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const snap = await getDocs(collection(db, 'images'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Replace 'Protective-collage' with your actual featured protective gear image name
      setFeatured(all.find(item => item.name === 'Flyaway'));
    }
    fetchFeatured();
  }, []);

  if (!featured)
    return <p className="text-center">Loading featured protective gear collage…</p>;

  return (
    <img
      src={featured.thumbnailUrl}
      alt={featured.name}
      className="thumbnail object-cover mx-auto"
      style={{ maxHeight: '80vh', width: 'auto' }}
    />
  );
}
