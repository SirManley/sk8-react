import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
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

        setSearchResults(filtered);
      } catch (e) {
        console.error('Search error:', e);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Search the Collection</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, group, description…"
          className="w-full border border-gray-300 p-2 rounded mb-4"
        />
        {loading ? (
          <p>Searching…</p>
        ) : searchTerm && searchResults.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map(result => (
              <li key={result.id} className="border p-2 rounded shadow-sm">
                <p className="font-semibold">{result.name}</p>
                <p className="text-sm text-gray-600">{result.description}</p>
                <p className="text-xs text-gray-500">
                  Groups: {result.groups?.join(', ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
