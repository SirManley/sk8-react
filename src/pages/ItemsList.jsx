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
  doc as firestoreDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

export default function ItemsList() {
  // pagination & data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // upload‐in‐progress state
  const [uploading, setUploading] = useState({});

  // NEW: search term state
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const pageSize = 10;

  // 1. Fetch first page
  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const firstQuery = query(
          collection(db, 'images'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        const snap = await getDocs(firstQuery);
        const docs = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setItems(docs);
        const lastDoc = snap.docs[snap.docs.length - 1];
        setLastVisible(lastDoc || null);
        if (snap.docs.length < pageSize) setHasMore(false);
      } catch (err) {
        console.error('Error fetching first page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFirstPage();
  }, []);

  // 2. Fetch next page
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
      const snap = await getDocs(nextQuery);
      const docs = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setItems(prev => [...prev, ...docs]);
      const lastDoc = snap.docs[snap.docs.length - 1];
      setLastVisible(lastDoc || null);
      if (snap.docs.length < pageSize) setHasMore(false);
    } catch (err) {
      console.error('Error fetching next page:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // 3. Delete handler
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(firestoreDoc(db, 'images', id));
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // 4. File‐upload handler (unchanged) …
  const handleFileUpload = async (e, itemId, type) => {
    // … your existing upload logic here …
  };

  // 5. While loading initial data
  if (loading) {
    return <div className="p-4 text-center">Loading…</div>;
  }

  // Compute filtered list by name
const term = searchTerm.toLowerCase();
const filteredItems = items.filter(item => {
  const nameMatch = item.name?.toLowerCase().includes(term);
  const descMatch = item.description
    ? item.description.toLowerCase().includes(term)
    : false;
  return nameMatch || descMatch;
});

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">All Uploaded Items</h1>
      <div className="mb-6 text-center">
        <Link
          to="/admin"
          className="inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* ——— Search Box ——— */}
      <div className="mb-4 text-center">
        <input
          type="text"
          placeholder="🔍 Search by name…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded w-full max-w-md"
        />
      </div>

      {/* ——— No items at all ——— */}
      {items.length === 0 ? (
        <p className="text-center">No items found in the database.</p>
      ) : (
        <>
          {/* ——— No items match the search ——— */}
          {filteredItems.length === 0 ? (
            <p className="text-center">
              No items match “{searchTerm}.”
            </p>
          ) : (
            /* ——— Items Table ——— */
            <table className="w-full border-collapse mb-4">
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
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1 truncate max-w-xs">
                      {item.description}
                    </td>
                    <td className="border px-2 py-1">
                      {item.groups?.join(', ')}
                    </td>
                    <td className="border px-2 py-1">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="block object-cover mx-auto rounded"
                          style={{ width: 'auto', height: '9rem' }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          No thumbnail
                        </div>
                      )}
                      {/* Thumbnail upload input */}
                      <label className="block mt-2 text-xs text-gray-600">
                        Change thumbnail:
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-1 block w-full text-xs"
                          onChange={e =>
                            handleFileUpload(e, item.id, 'thumbnail')
                          }
                        />
                      </label>
                      {uploading[item.id]?.thumbnail && (
                        <p className="text-xs text-blue-500">
                          Uploading thumbnail…
                        </p>
                      )}
                    </td>
                    <td className="border px-2 py-1 space-y-1">
                      {item.imageUrl && (
                        <a
                          href={item.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm block"
                        >
                          View full image
                        </a>
                      )}
                      <label className="block text-xs text-gray-600">
                        Change full image:
                        <input
                          type="file"
                          accept="image/*"
                          className="mt-1 block w-full text-xs"
                          onChange={e =>
                            handleFileUpload(e, item.id, 'image')
                          }
                        />
                      </label>
                      {uploading[item.id]?.image && (
                        <p className="text-xs text-blue-500">
                          Uploading full image…
                        </p>
                      )}
                      <button
                        onClick={() => navigate(`/items/${item.id}/edit`)}
                        className="text-yellow-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
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
          )}

          {/* ——— Load More button for pagination ——— */}
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
