// src/pages/Admin.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const GROUPS = {
  Skateboards: ['Old-School', 'New-School', 'Shaped', 'Freestyle', 'Mike-McGill', 'Tony-Hawk', 'All-Skateboards'],
  Trucks: ['Old-School', 'New-School', 'Independent', 'Grind King', 'Tracker', 'Thunder', 'Venture', 'Other', 'All-Trucks'],
  Wheels: ['Old-School', 'New-School', 'Powell', 'Bones', 'Spitfire', 'OJ', 'Other', 'All-Wheels'],
  'Soft-Goods': ['Apparel', 'Safety-Gear', 'Patches'],
  Accessories: ['Bearings', 'Grip-Tape', 'Hardware', 'Rails', 'Plastic-Guards', 'Risers', 'Tools', 'Other', 'All-Accessories'],
  Apparel: ['Shirts', 'Shoes', 'Hats', 'Pants', 'Other', 'All-Apparel'],
  Memorabilia: ['Stickers', 'Patches', 'Pins', 'Posters', 'Magazines', 'Media', 'Other', 'All-Memorabilia'],
  Protective: ['Helmets', 'Elbow', 'Knee', 'Ankle', 'Wrist', 'Hand', 'Other', 'All-Protective'],
};

export default function Admin() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    groups: [],
    subGroups: [],
    youtubeUrl: ''
  });

  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]); // NEW: additional images (optional)

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
        const parent = value;
        if (checked) {
          const allSub = GROUPS[parent].find(s => s.startsWith('All-'));
          setForm(prev => ({
            ...prev,
            groups: [...prev.groups, parent],
            subGroups: allSub ? [...new Set([...prev.subGroups, allSub])] : prev.subGroups
          }));
        } else {
          setForm(prev => ({
            ...prev,
            groups: prev.groups.filter(g => g !== parent),
            subGroups: prev.subGroups.filter(sub => !GROUPS[parent].includes(sub))
          }));
        }
      } else if (name === 'subGroups') {
        setForm(prev => ({
          ...prev,
          subGroups: checked
            ? [...prev.subGroups, value]
            : prev.subGroups.filter(s => s !== value)
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadToStorage = async (pathPrefix, file) => {
    const safeName = `${Date.now()}-${file.name}`;
    const fileRef = ref(storage, `${pathPrefix}/${safeName}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!fullFile || !thumbFile)
      return alert('Select both images first.');

    // 1) Upload primary full + thumbnail
    const fullUrl = await uploadToStorage('images', fullFile);
    const thumbUrl = await uploadToStorage('thumbnails', thumbFile);

    // 2) Upload optional extra images (if any)
    const extraUrls = [];
    for (const f of extraFiles) {
      if (!f) continue;
      const url = await uploadToStorage('images', f);
      extraUrls.push(url);
    }

    // 3) Build images[] array: first = fullUrl, then extras
    const images = [{ src: fullUrl, alt: form.name }];
    extraUrls.forEach((u, i) => images.push({ src: u, alt: `${form.name} (extra ${i + 1})` }));

    // 4) Compose the Firestore doc (keeps legacy fields + new images[])
    const newItem = {
      name: form.name,
      description: form.description,
      imageUrl: fullUrl,       // legacy single full image
      thumbnailUrl: thumbUrl,  // legacy single thumb
      images,                  // NEW: gallery images
      groups: form.groups,
      subGroups: form.subGroups,
      createdAt: new Date()
    };

    if (form.youtubeUrl?.trim()) {
      newItem.youtubeUrl = form.youtubeUrl.trim();
    }

    await addDoc(collection(db, 'images'), newItem);

    alert('Image uploaded successfully!');
    setForm({ name: '', description: '', groups: [], subGroups: [], youtubeUrl: '' });
    setFullFile(null);
    setThumbFile(null);
    setExtraFiles([]);
  };

  return (
    <main className="admin-page container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Upload</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <Link
          to="/items"
          className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          View All Uploaded Items
        </Link>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block mb-1"><strong>Name:</strong></label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="border p-2 w-full" />
        </div>

        <div>
          <label className="block mb-1"><strong>Description:</strong></label>
          <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full" />
        </div>

        <div>
          <label className="block mb-1">Full Image:</label>
          <input type="file" accept="image/*" onChange={e => setFullFile(e.target.files[0])} required className="block" />
        </div>

        <div>
          <label className="block mb-1">Thumbnail:</label>
          <input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files[0])} required className="block" />
        </div>

        {/* NEW: Additional gallery images (optional, multiple) */}
        <div>
          <label className="block mb-1">Additional Images (optional):</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setExtraFiles(Array.from(e.target.files))}
            className="block"
          />
          <p className="text-xs text-gray-600 mt-1">You can select multiple files. These will appear as extra slides in the lightbox.</p>
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
                    <label key={subName} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        name="subGroups"
                        value={subName}
                        checked={form.subGroups.includes(subName)}
                        onChange={handleChange}
                        disabled={!parentIsChecked}
                        className="form-checkbox disabled:opacity-50"
                      />
                      <span className={parentIsChecked ? 'text-gray-700' : 'text-gray-400'}>{subName}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conditionally show YouTube URL input when Media is selected */}
        {form.subGroups.includes("Media") && (
          <div>
            <label className="block mb-1">YouTube URL (optional):</label>
            <input
              type="text"
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=xyz123abc"
              className="border p-2 w-full"
            />
          </div>
        )}

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>
    </main>
  );
}
