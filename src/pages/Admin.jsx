// src/pages/Admin.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth'; // 🔐 added

const GROUPS = {
  Skateboards: [
    'Old-School',
    'New-School',
    'Shaped',
    'Freestyle',
    'Mike-McGill',
    'Tony-Hawk',
    'All-Skateboards'
  ],
  Trucks: [
    'Old-School',
    'New-School',
    'Independent',
    'Grind King',
    'Tracker',
    'Thunder',
    'Venture',
    'Other',
    'All-Trucks'
  ],
  Wheels: [
    'Old-School',
    'New-School',
    'Powell',
    'Bones',
    'Spitfire',
    'OJ',
    'Other',
    'All-Wheels'
  ],
  'Soft-Goods': ['Apparel', 'Safety-Gear', 'Patches'],
  Accessories: [
    'Bearings',
    'Grip-Tape',
    'Hardware',
    'Rails',
    'Plastic-Guards',
    'Risers',
    'Tools',
    'Other',
    'All-Accessories'
  ],
  Apparel: [
    'Shirts',
    'Shoes',
    'Hats',
    'Pants',
    'Other',
    'All-Apparel'
  ],
  
Memorabilia: [
    'Stickers',
    'Patches',
    'Pins',
    'Posters',
    'Magazines',
    'Media',
    'Other',
    'All-Memorabilia'
  ],

  Protective: [
    'Helmets',
    'Elbow',
    'Knee',
    'Ankle',
    'Wrist',
    'Hand',
    'Other',
    'All-Protective'
  ],




};

export default function Admin() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    groups: [],
    subGroups: []
  });
  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  // 🔐 Logout handler
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = '/login';
    });
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'groups') {
        if (checked) {
          const parent = value;
          const allSub = GROUPS[parent].find(s => s.startsWith('All-'));
          setForm(prev => ({
            ...prev,
            groups: [...prev.groups, parent],
            subGroups: allSub
              ? [...new Set([...prev.subGroups, allSub])]
              : prev.subGroups
          }));
        } else {
          const parent = value;
          setForm(prev => ({
            ...prev,
            groups: prev.groups.filter(g => g !== parent),
            subGroups: prev.subGroups.filter(
              sub => !GROUPS[parent].includes(sub)
            )
          }));
        }
      } else if (name === 'subGroups') {
        if (checked) {
          setForm(prev => ({
            ...prev,
            subGroups: [...prev.subGroups, value]
          }));
        } else {
          setForm(prev => ({
            ...prev,
            subGroups: prev.subGroups.filter(s => s !== value)
          }));
        }
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!fullFile || !thumbFile)
      return alert('Select both images first.');

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
      subGroups: form.subGroups,
      createdAt: new Date()
    });

    alert('Image uploaded successfully!');
    setForm({ name: '', description: '', groups: [], subGroups: [] });
    setFullFile(null);
    setThumbFile(null);
  };

  return (
    <main className="admin-page container mx-auto p-4">
      {/* Header row with logout button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Upload</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {/* View Items */}
      <div className="mb-6">
        <Link
          to="/items"
          className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          View All Uploaded Items
        </Link>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block mb-1">
            <strong> Name: </strong>
          </label>
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
          <label className="block mb-1">
            <strong> Description: </strong>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Full Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFullFile(e.target.files[0])}
            required
            className="block"
          />
        </div>

        <div>
          <label className="block mb-1">Thumbnail:</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbFile(e.target.files[0])}
            required
            className="block"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Groups:</label>
          {Object.entries(GROUPS).map(([parentName, subArr]) => {
            const parentIsChecked = form.groups.includes(parentName);
            return (
              <div key={parentName} className="mb-4 border rounded p-2">
                <label className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    name="groups"
                    value={parentName}
                    checked={parentIsChecked}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <strong>{parentName}</strong>
                </label>
                <div className="ml-6 flex flex-wrap gap-2">
                  {subArr.map(subName => (
                    <label
                      key={subName}
                      className="flex items-center space-x-1"
                    >
                      <input
                        type="checkbox"
                        name="subGroups"
                        value={subName}
                        checked={form.subGroups.includes(subName)}
                        onChange={handleChange}
                        disabled={!parentIsChecked}
                        className="form-checkbox disabled:opacity-50"
                      />
                      <span
                        className={
                          parentIsChecked
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }
                      >
                        {subName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
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
