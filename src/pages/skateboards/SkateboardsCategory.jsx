// src/pages/skateboards/SkateboardsCategory.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function SkateboardsCategory() {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchByCategory() {
      setLoading(true);

      // map slug -> Firestore tag, with a special case for mike-mcgill
      const tagToQuery =
        category === 'complete-collection'
          ? 'All-Skateboards'
          : category === 'mike-mcgill'
            ? 'Mike-McGill'
            : category
                .split('-')
                .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
                .join('-');

      try {
        const q = query(
          collection(db, 'images'),
          where('subGroups', 'array-contains', tagToQuery)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filtered = docs.filter(
          item =>
            Array.isArray(item.groups) &&
            item.groups.includes('Skateboards')
        );
        setItems(filtered);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    if (category) {
      fetchByCategory();
    }
  }, [category]);

  const displayLabel =
    category === 'complete-collection'
      ? 'All Skateboards'
      : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (loading) return <p className="text-center">Loading {displayLabel}…</p>;
  if (!items.length)
    return <p className="text-center">No skateboards found for “{displayLabel}.”</p>;

  return (
    <div className="w-4/5 mx-auto px-4">
      <h2 className="mb-4 text-2xl font-semibold text-center capitalize">
        {displayLabel}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, auto))',
          gap: '1rem',
        }}
      >
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded overflow-hidden shadow hover:shadow-lg transition p-2 flex flex-col items-center"
          >
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              style={{ height: '14rem', width: 'auto' }}
            />
            {item.name && (
              <p className="mt-2 text-center text-sm font-medium text-gray-800">
                {item.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
