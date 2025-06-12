import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { subGroupMap } from '../../data/subGroupMap';

export default function WheelsCategory() {
  const { category } = useParams();
  const { setSelectedItem } = useOutletContext();    // ← grab modal opener
  const group = 'wheels';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchByCategory() {
      setLoading(true);
      const mapKey = `${group}/${category}`;
      const tagToQuery = subGroupMap[mapKey] || category;

      try {
        const q = query(
          collection(db, 'images'),
          where('subGroups', 'array-contains', tagToQuery)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filtered = docs.filter(
          (item) =>
            Array.isArray(item.groups) && item.groups.includes('Wheels')
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
  }, [category, group]);

  const displayLabel =
    category === 'complete-collection'
      ? 'All Wheels'
      : category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) return <p className="text-center">Loading {displayLabel}…</p>;
  if (!items.length)
    return <p className="text-center">No wheels found for “{displayLabel}.”</p>;

  return (
    <div className="w-4/5 mx-auto px-4" style={{ overflowX: 'hidden' }}>
      <h2 className="mb-4 text-2xl font-semibold text-center capitalize">
        {displayLabel}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '6rem',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedItem(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedItem(item);
              }
            }}
            className="
              cursor-pointer
              bg-white rounded overflow-hidden shadow
              hover:shadow-lg transition p-2 flex flex-col items-center
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            "
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
