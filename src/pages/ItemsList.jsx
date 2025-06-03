// src/pages/ItemsList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  doc,         // ← NEW: import doc
  deleteDoc    // ← NEW: import deleteDoc
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom'; // ← UPDATED: import useNavigate

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ← NEW: hook for programmatic navigation

  useEffect(() => {
    // 1. Grab all docs in "images" collection
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'images'));
        // 2. Map to an array of { id, ...data }
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setItems(docs);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // ← NEW: Handler to delete one document
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'images', id));
      // Remove it from local state so UI updates instantly
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading…</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">All Uploaded Items</h1>

      {/* Link back to Admin */}
      <div className="mb-6 text-center">
        <Link
          to="/admin"
          className="inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ← Back to Admin
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-center">No items found in the database.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded p-4 flex items-center space-x-4"
            >
              {/* Thumbnail */}
              {item.thumbnailUrl && (
                <img
                  src={item.thumbnailUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
              )}

              {/* Textual info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600 mb-1">{item.description}</p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Groups:</span> {item.groups?.join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">SubGroups:</span> {item.subGroups?.join(', ')}
                </p>
              </div>

              {/* Actions: View, Edit, Delete */}
              <div className="flex flex-col space-y-2">
                {/* View full-size image link */}
                {item.imageUrl && (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View Full Image
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
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
