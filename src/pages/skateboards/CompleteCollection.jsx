// src/pages/skateboards/CompleteCollection.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function CompleteCollection() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllSkateboards() {
      setLoading(true);
      try {
        // now matching your "Groups" + "subGroups" schema
        const q = query(
          collection(db, 'images'),
          where('groups', '==', 'Skateboards'),
          where('subGroups', 'array-contains', 'All-Skateboards')
        );
        const snap = await getDocs(q);
        setBoards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching complete collection:', err);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAllSkateboards();
  }, []);

  if (loading) {
    return <p className="text-center">Loading complete collection…</p>;
  }

  if (!boards.length) {
    return (
      <p className="text-center">
        No skateboards found in the complete collection.
      </p>
    );
  }

  return (
    <div className="w-full px-4">
      <h2 className="mb-4 text-2xl font-semibold text-center">
        Complete Collection
      </h2>
      <div className="grid gap-4
                      grid-cols-1
                      sm:grid-cols-2
                      md:grid-cols-3
                      lg:grid-cols-4
                      xl:grid-cols-5">
        {boards.map(board => (
          <div
            key={board.id}
            className="bg-white rounded overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={board.thumbnailUrl}
              alt={board.name}
              className="w-full h-auto object-cover"
            />
            {board.name && (
              <p className="mt-2 text-center text-sm font-medium text-gray-800">
                {board.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
