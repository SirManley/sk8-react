// src/pages/Admin.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';          // ← Import Link
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

// 1. GROUPS is an object whose keys are parent names.
//    Each key maps to an array of subcategory strings.
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
    'Grind-King',
    'Tracker',
    'Thunder',
    'All-Trucks'
  ],
  Wheels: [
    'Old-School',
    'New-School',
    'Powell',
    'Bones',
    'Spitfire',
    'OJII',
    'All-Wheels'
  ],
  'Soft-Goods': [
    'Apparel',
    'Safety-Gear',
    'Patches'
  ],
  Accessories: [
    'Grip-Tape',
    'Hardware',
    'Rails',
    'Plastic-Guards',
    'Risers',
    'Tools'
  ],
  Stickers: [
    'McGill',
    'All-Stickers'
  ]
};

export default function Admin() {
  // 2. Our form state now contains two arrays: groups (parents) and subGroups (children)
  const [form, setForm] = useState({
    name: '',
    description: '',
    groups: [],     // e.g. ["Skateboards", "Wheels"]
    subGroups: []   // e.g. ["Old-School", "All-Wheels"]
  });
  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  // 3. Whenever a checkbox toggles, we look at `e.target.name`:
  //    - name==="groups" implies a parent checkbox was clicked.
  //    - name==="subGroups" implies a subcategory checkbox was clicked.
  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'groups') {
        // --- Parent was toggled ---
        if (checked) {
          // 3a. Add this parent into form.groups
          // 3b. Also auto-select the “All-…” subcategory under that parent
          //     (if it exists).
          const parent = value;
          const allSub = GROUPS[parent].find(s => s.startsWith('All-'));
          setForm(prev => ({
            ...prev,
            groups: [...prev.groups, parent],
            subGroups: allSub
              ? [...new Set([ ...prev.subGroups, allSub ])]
              : prev.subGroups
          }));
        } else {
          // 3c. Parent was unchecked—remove it from form.groups,
          //      and also remove ANY of its subcategories from form.subGroups.
          const parent = value;
          setForm(prev => ({
            ...prev,
            groups: prev.groups.filter(g => g !== parent),
            subGroups: prev.subGroups.filter(sub => {
              // drop any sub that belongs to this parent
              return !GROUPS[parent].includes(sub);
            })
          }));
        }
      } else if (name === 'subGroups') {
        // --- Subcategory was toggled manually ---
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
      // a normal <input name="name" /> or <textarea name="description" />
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 4. Upload handler (unchanged except for writing both groups & subGroups)
  const handleUpload = async e => {
    e.preventDefault();
    if (!fullFile || !thumbFile) return alert('Select both images first.');

    // Upload files to Firebase Storage
    const fullRef = ref(storage, `images/${fullFile.name}`);
    const thumbRef = ref(storage, `thumbnails/${thumbFile.name}`);
    await uploadBytes(fullRef, fullFile);
    await uploadBytes(thumbRef, thumbFile);

    // Grab download URLs
    const fullUrl = await getDownloadURL(fullRef);
    const thumbUrl = await getDownloadURL(thumbRef);

    // Write Firestore document
    await addDoc(collection(db, 'images'), {
      name: form.name,
      description: form.description,
      imageUrl: fullUrl,
      thumbnailUrl: thumbUrl,
      groups: form.groups,       // e.g. ["Skateboards", "Wheels"]
      subGroups: form.subGroups, // e.g. ["All-Skateboards", "Bones"]
      createdAt: new Date()
    });

    alert('Image uploaded successfully!');
    setForm({ name: '', description: '', groups: [], subGroups: [] });
    setFullFile(null);
    setThumbFile(null);
  };

  return (
    <main className="admin-page container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Upload</h1>

      {/* ————————————————————————————— */}
      {/*  View All Uploaded Items Button */}
      <div className="mb-6">
        <Link
          to="/items"
          className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          View All Uploaded Items
        </Link>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* ————————————————————————————— */}
        {/*  Name Field */}
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

        {/* ————————————————————————————— */}
        {/*  Description Field */}
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

        {/* ————————————————————————————— */}
        {/*  Full Image File Picker */}
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

        {/* ————————————————————————————— */}
        {/*  Thumbnail File Picker */}
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

        {/* ————————————————————————————— */}
        {/*  Parent + Subcategory Checkboxes */}
        <div>
          <label className="block mb-2 font-semibold">Groups:</label>

          {/** Loop over each parent **/}
          {Object.entries(GROUPS).map(([parentName, subArr]) => {
            // Is this parent currently checked?
            const parentIsChecked = form.groups.includes(parentName);

            return (
              <div key={parentName} className="mb-4 border rounded p-2">
                {/* 4a. Render the parent checkbox */}
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

                {/** 4b. Render each subcategory under this parent **/}
                <div className="ml-6 flex flex-wrap gap-2">
                  {subArr.map(subName => {
                    // If the parent is not checked, this sub is disabled (=greyed out).
                    // If the parent just became checked, and this sub startsWith "All-", it'll already be in form.subGroups,
                    // so it shows as checked.
                    return (
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
                          // disabled if parent is not checked
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ————————————————————————————— */}
        {/*  Submit Button */}
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
