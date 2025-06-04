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
  // State for items, loading flags, pagination, and upload progress
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [uploading, setUploading] = useState({}); 
  // uploading: { [itemId]: { thumbnail: boolean, image: boolean } }

  const navigate = useNavigate();
  const pageSize = 10; // fetch 10 items per page

  // 1. Fetch the first page on mount
  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const firstQuery = query(
          collection(db, 'images'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
        const snapshot = await getDocs(firstQuery);

        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setItems(docs);

        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc || null);

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
      setItems((prev) => [...prev, ...docs]);

      const newLast = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(newLast || null);

      if (snapshot.docs.length < pageSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // 3. Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(firestoreDoc(db, 'images', id));
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // 4. File upload handler (thumbnail or full image)
  const handleFileUpload = async (e, itemId, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Mark as uploading
    setUploading((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [type]: true
      }
    }));

    try {
      const storage = getStorage();
      const folder = `images/${itemId}`;
      const fileName = type === 'thumbnail' ? 'thumbnail' : 'full';
      const ext = file.name.split('.').pop();
      const path = `${folder}/${fileName}.${ext}`;
      const sRef = storageRef(storage, path);

      const uploadTask = uploadBytesResumable(sRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Upload error:', error);
          setUploading((prev) => ({
            ...prev,
            [itemId]: {
              ...(prev[itemId] || {}),
              [type]: false
            }
          }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const docRef = firestoreDoc(db, 'images', itemId);
          const updateData = {};
          if (type === 'thumbnail') {
            updateData.thumbnailUrl = downloadURL;
          } else {
            updateData.imageUrl = downloadURL;
          }
          await updateDoc(docRef, updateData);

          setItems((prevItems) =>
            prevItems.map((it) =>
              it.id === itemId ? { ...it, ...updateData } : it
            )
          );

          setUploading((prev) => ({
            ...prev,
            [itemId]: {
              ...(prev[itemId] || {}),
              [type]: false
            }
          }));
        }
      );
    } catch (err) {
      console.error('Unexpected upload error:', err);
      setUploading((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          [type]: false
        }
      }));
    }
  };

  // 5. Render loading state
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
                  {/* Name */}
                  <td className="border px-2 py-1">{item.name}</td>

                  {/* Description */}
                  <td className="border px-2 py-1 truncate max-w-xs">
                    {item.description}
                  </td>

                  {/* Groups */}
                  <td className="border px-2 py-1">
                    {item.groups?.join(', ')}
                  </td>

                  {/* Thumbnail & Thumbnail Upload */}
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
                      <div className="text-sm text-gray-500">No thumbnail</div>
                    )}
                    <label className="block mt-2 text-xs text-gray-600">
                      Change thumbnail:
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-1 block w-full text-xs"
                        onChange={(e) => handleFileUpload(e, item.id, 'thumbnail')}
                      />
                    </label>
                    {uploading[item.id]?.thumbnail && (
                      <p className="text-xs text-blue-500">Uploading thumbnail…</p>
                    )}
                  </td>

                  {/* Actions: View/Edit/Delete + Full Image Upload */}
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
                        onChange={(e) => handleFileUpload(e, item.id, 'image')}
                      />
                    </label>
                    {uploading[item.id]?.image && (
                      <p className="text-xs text-blue-500">Uploading full image…</p>
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
