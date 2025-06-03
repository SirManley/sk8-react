// src/pages/EditItem.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

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

export default function EditItem() {
  const { id } = useParams();            // Grab the ID from /items/:id/edit
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    groups: [],
    subGroups: []
  });

  // 1. On mount, fetch that single document
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, 'images', id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          console.error('No such document!');
          return;
        }
        const data = snap.data();
        // Populate form state exactly as Firestore stored it
        setForm({
          name: data.name || '',
          description: data.description || '',
          groups: data.groups || [],
          subGroups: data.subGroups || []
        });
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  // 2. Handle input/checkbox changes (similar to Admin page)
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'groups') {
        if (checked) {
          // Selecting a parent: auto‐select its “All-…” subcategory if present
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
          // Unchecking a parent: remove it and all its children
          const parent = value;
          setForm(prev => ({
            ...prev,
            groups: prev.groups.filter(g => g !== parent),
            subGroups: prev.subGroups.filter(sub => !GROUPS[parent].includes(sub))
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

  // 3. On Save, call updateDoc()
  const handleSave = async e => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'images', id);
      await updateDoc(docRef, {
        name: form.name,
        description: form.description,
        groups: form.groups,
        subGroups: form.subGroups
      });
      alert('Item updated successfully');
      navigate('/items'); // Go back to the list (or anywhere you like)
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading…</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Item</h1>

      {/* Link back to the items list */}
      <div className="mb-6 text-center">
        <Link
          to="/items"
          className="inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ← Back to Items
        </Link>
      </div>

      <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1">Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        {/* Groups & SubGroups (same logic as Admin.jsx) */}
        <div>
          <label className="block mb-2 font-semibold">Groups:</label>
          {Object.entries(GROUPS).map(([parentName, subArr]) => {
            const parentIsChecked = form.groups.includes(parentName);

            return (
              <div key={parentName} className="mb-4 border rounded p-2">
                {/* Parent checkbox */}
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

                {/* Subcategory checkboxes */}
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
                      <span
                        className={
                          parentIsChecked ? 'text-gray-700' : 'text-gray-400'
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

        {/* Save button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}
