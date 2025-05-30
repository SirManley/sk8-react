// File: src/pages/Admin.jsx
import React, { useState } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const GROUPS = ['Decks', 'Trucks', 'Wheels', 'Soft Goods'];

export default function Admin() {
  const [form, setForm] = useState({ name: '', description: '', groups: [] });
  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({
        ...prev,
        groups: checked
          ? [...prev.groups, value]
          : prev.groups.filter(g => g !== value),
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!fullFile || !thumbFile) return alert('Select both images first.');

    const fullRef = ref(storage, `images/${fullFile.name}`);
    const thumbRef = ref(storage, `thumbnails/${thumbFile.name}`);
    await uploadBytes(fullRef, fullFile);
    await uploadBytes(thumbRef, thumbFile);

    const fullUrl = await getDownloadURL(fullRef);
    const thumbUrl = await getDownloadURL(thumbRef);

    await addDoc(collection(db, 'images'), {
      name: form.name,
      description: form.description,
      imageUrl: fullUrl,
      thumbnailUrl: thumbUrl,
      groups: form.groups,
      createdAt: new Date(),
    });

    alert('Image uploaded successfully!');
    setForm({ name: '', description: '', groups: [] });
    setFullFile(null);
    setThumbFile(null);
  };

  return (
    <main className="admin-page container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Upload</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Full Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFullFile(e.target.files[0])}
            required
          />
        </div>
        <div>
          <label>Thumbnail:</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbFile(e.target.files[0])}
            required
          />
        </div>
        <div>
          <label>Groups:</label>
          <div className="flex space-x-4">
            {GROUPS.map(g => (
              <label key={g}>
                <input
                  type="checkbox"
                  name="groups"
                  value={g}
                  checked={form.groups.includes(g)}
                  onChange={handleChange}
                />{' '}
                {g}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>
    </main>
  );
}
