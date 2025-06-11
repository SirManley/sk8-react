// src/pages/wheels/WheelsHome.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function WheelsHome() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const snap = await getDocs(collection(db, 'images'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFeatured(all.find(item => item.name === 'Wheels-collage'));
    }
    fetchFeatured();
  }, []);

  if (!featured) return <p>Loading featured wheel image…</p>;

  return (
    <img
      src={featured.thumbnailUrl}
      alt={featured.name}
      className="thumbnail object-cover"
    />
    
    //  The img above can be replace with below
    //<img
    //src={featured.thumbnailUrl}
    //alt={featured.name}
    //className="thumbnail object-contain mx-auto"
    // style={{
        //maxHeight: '80vh', // don’t exceed 80% of viewport height
    // width: 'auto',
    // display: 'block',
    //}}
    ///>
  );
}
