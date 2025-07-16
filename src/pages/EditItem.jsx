// src/pages/EditItem.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const GROUPS = {
  Skateboards: ['Old-School', 'New-School', 'Shaped', 'Freestyle', 'Mike-McGill', 'Tony-Hawk', 'All-Skateboards'],
  Trucks: ['Old-School', 'New-School', 'Independent', 'Grind King', 'Tracker', 'Thunder', 'Venture', 'Other', 'All-Trucks'],
  Wheels: ['Old-School', 'New-School', 'Powell', 'Bones', 'Spitfire', 'OJ', 'Other', 'All-Wheels'],
  Accessories: ['Bearings', 'Grip-Tape', 'Hardware', 'Rails', 'Plastic-Guards', 'Risers', 'Tools', 'Other', 'All-Accessories'],
  Apparel: ['Shirts', 'Shoes', 'Hats', 'Pants', 'Other', 'All-Apparel'],
  Memorabilia: ['Stickers', 'patches', 'Pins', 'Posters', 'Magazines','Media', 'Other', 'All-Memorabilia'],
  Protective: ['Helmets', 'Elbow', 'Knee', 'Ankle', 'Wrist', 'Hand', 'Other', 'All-Protective'],
};

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    description: '',
    groups: [],
    subGroups: [],
    imageUrl: '',
    thumbnailUrl: '',
    youtubeUrl: '' // ✅ added field
  });

  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

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
        setForm({
          name: data.name || '',
          description: data.description || '',
          groups: data.groups || [],
          subGroups: data.subGroups || [],
          imageUrl: data.imageUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
          youtubeUrl: data.youtubeUrl || '' // ✅ load existing YouTube URL if present
        });
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'groups') {
        if (checked) {
          const allSub = GROUPS[value].find(s => s.startsWith('All-'));
          setForm(prev => ({
            ...prev,
            groups: [...prev.groups, value],
            subGroups: allSub ? [...new Set([...prev.subGroups, allSub])] : prev.subGroups
          }));
        } else {
          setForm(prev => ({
            ...prev,
            groups: prev.groups.filter(g => g !== value),
            subGroups: prev.subGroups.filter(sub => !GROUPS[value].includes(sub))
          }));
        }
      } else if (name === 'subGroups') {
        if (checked) {
          setForm(prev => ({ ...prev, subGroups: [...prev.subGroups, value] }));
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

  const handleSave = async e => {
    e.preventDefault();
    try {
      let newImageUrl = form.imageUrl;
      let newThumbUrl = form.thumbnailUrl;

      if (fullFile) {
        const fullRef = ref(storage, `images/${fullFile.name}`);
        await uploadBytes(fullRef, fullFile);
        newImageUrl = await getDownloadURL(fullRef);
      }

      if (thumbFile) {
        const thumbRef = ref(storage, `thumbnails/${thumbFile.name}`);
        await uploadBytes(thumbRef, thumbFile);
        newThumbUrl = await getDownloadURL(thumbRef);
      }

      const docRef = doc(db, 'images', id);
      const updatedItem = {
        name: form.name,
        description: form.description,
        groups: form.groups,
        subGroups: form.subGroups,
        imageUrl: newImageUrl,
        thumbnailUrl: newThumbUrl
      };

      // ✅ Only include youtubeUrl if not empty
      if (form.youtubeUrl?.trim()) {
        updatedItem.youtubeUrl = form.youtubeUrl.trim();
      }

      await updateDoc(docRef, updatedItem);

      alert('Item updated successfully!');
      navigate('/items');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading…</div>;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Item</h1>

      <div className="mb-6 text-center">
        <Link
          to="/items"
          className="inline-block bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ← Back to Items
        </Link>
      </div>

      <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Name:</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={100}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={400}
            className="border p-2 w-full"
          />
        </div>

        {/* Full image section */}
        <div>
          <label className="block mb-1 font-semibold">Full Image:</label>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Full"
              className="mb-2 max-h-60 mx-auto object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => setFullFile(e.target.files[0])}
            className="block"
          />
        </div>

        {/* Thumbnail section */}
        <div>
          <label className="block mb-1 font-semibold">Thumbnail:</label>
          {form.thumbnailUrl && (
            <img
              src={form.thumbnailUrl}
              alt="Thumbnail"
              className="mb-2 max-h-40 mx-auto object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => setThumbFile(e.target.files[0])}
            className="block"
          />
        </div>

        {/* Groups & Subgroups */}
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
                      <span className={parentIsChecked ? 'text-gray-700' : 'text-gray-400'}>
                        {subName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ Conditionally show YouTube URL input */}
        {form.subGroups.includes('Media') && (
          <div>
            <label className="block mb-1 font-semibold">YouTube URL (optional):</label>
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
