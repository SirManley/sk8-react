import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function MemorabiliaHome() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const snap = await getDocs(collection(db, 'images'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Replace 'Memorabilia-collage' with your actual featured memorabilia item name
      setFeatured(all.find(item => item.name === 'Memorabilia-collage'));
    }
    fetchFeatured();
  }, []);

  if (!featured)
    return <p className="text-center">Loading featured memorabilia collage…</p>;

  return (
    <img
      src={featured.thumbnailUrl}
      alt={featured.name}
      className="thumbnail object-cover mx-auto"
      style={{ maxHeight: '80vh', width: 'auto' }}
    />
  );
}
