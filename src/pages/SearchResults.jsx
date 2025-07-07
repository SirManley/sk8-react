import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SearchResults() {
  const { setSelectedItem } = useOutletContext(); // ✅ pull from context
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const term = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'images'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const filtered = all.filter(item => {
          const nameMatch = item.name?.toLowerCase().includes(term);
          const descMatch = item.description?.toLowerCase().includes(term);
          const groupMatch = item.groups?.some(g => g.toLowerCase().includes(term));
          const subMatch = item.subGroups?.some(s => s.toLowerCase().includes(term));
          return nameMatch || descMatch || groupMatch || subMatch;
        });

        setResults(filtered);
      } catch (e) {
        console.error('Search error:', e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (term) fetchResults();
  }, [term]);

  if (loading) return <p className="text-center">Searching for “{term}”...</p>;
  if (!results.length)
    return <p className="text-center">No results found for “{term}.”</p>;

  return (
    <div className="w-4/5 mx-auto px-4">
      <h2 className="mb-4 text-2xl font-semibold text-center capitalize">
        Search Results for “{term}”
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '6rem',
          justifyItems: 'center',
        }}
      >
        {results.map(item => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedItem(item)} // ✅ triggers modal
            onKeyDown={e => {
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
              style={{
                maxHeight: '14rem',
                width: '100%',
                objectFit: 'contain',
              }}
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

