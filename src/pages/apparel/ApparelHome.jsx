import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ApparelHome() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const snap = await getDocs(collection(db, 'images'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Replace 'Apparel-collage' with your actual featured apparel image name
      setFeatured(all.find(item => item.name === 'Apparel-collage'));
    }
    fetchFeatured();
  }, []);

  if (!featured)
    return <p className="text-center">Loading featured apparel collage…</p>;

  return (
    <img
      src={featured.thumbnailUrl}
      alt={featured.name}
      className="thumbnail object-cover mx-auto"
      style={{ maxHeight: '80vh', width: 'auto' }}
    />
  );
}
