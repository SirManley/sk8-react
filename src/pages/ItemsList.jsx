// src/pages/ItemsList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export default function ItemsList() {
  // State for items, loading flags, and pagination cursor
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null); // Firestore document snapshot
  const [hasMore, setHasMore] = useState(true); // whether there are more docs to load
  const navigate = useNavigate();

  const pageSize = 20; // fetch 20 items per page

  // 1. Fetch the first page on mount
  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        // Build a query ordering by createdAt desc, limit to pageSize
        const firstQuery = query(
          collection(db, 'images'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        const snapshot = await getDocs(firstQuery);

        // Map docs to data
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setItems(docs);

        // Set the last document for cursor
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc || null);

        // If fewer than pageSize docs returned, no more pages
        if (snapshot.docs.length < pageSize) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching first page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPage();
  }, []);

  // 2. Handler to load the next page
  const fetchNextPage = async () => {
    if (!lastVisible) return;
    setLoadingMore(true);
    try {
      const nextQuery = query(
        collection(db, 'images'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(pageSize)
      );
      const snapshot = await getDocs(nextQuery);

      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      // Append new items
      setItems((prev) => [...prev, ...docs]);

      // Update cursor
      const newLast = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(newLast || null);

      // If fewer than pageSize returned, no more pages
      if (snapshot.docs.length < pageSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 3. Delete handler (same as before)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'images', id));
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // 4. Render loading state
  if (loading) {
    return <div className="p-4 text-center">Loading…</div>;
  }

  return (
    <main className="container mx-auto p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4 text-center">All Uploaded Items</h1>
      <div className="mb-6 text-center">
        <Link
          to="/admin"
          className="inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* If no items at all */}
      {items.length === 0 ? (
        <p className="text-center">No items found in the database.</p>
      ) : (
        <>
          {/* Table of items */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Description</th>
                <th className="border px-2 py-1">Groups</th>
                <th className="border px-2 py-1">Thumbnail</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1 truncate max-w-xs">
                    {item.description}
                  </td>
                  <td className="border px-2 py-1">
                    {item.groups?.join(', ')}
                  </td>
                  <td className="border px-2 py-1">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                        loading="lazy"
                      />
                    )}
                  </td>
                  <td className="border px-2 py-1 space-x-2">
                    {/* View full image */}
                    {item.imageUrl && (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View
                      </a>
                    )}
                    {/* Edit button */}
                    <button
                      onClick={() => navigate(`/items/${item.id}/edit`)}
                      className="text-yellow-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Load More button */}
          {hasMore && (
            <div className="text-center mt-4">
              <button
                onClick={fetchNextPage}
                disabled={loadingMore}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
