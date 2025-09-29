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
    images: [],       // NEW
    youtubeUrl: ''
  });

  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // NEW: files to add

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

        // Build images[] with back-compat if missing
        let imagesArr = Array.isArray(data.images) ? data.images : [];
        if (!imagesArr.length && data.imageUrl) {
          imagesArr = [{ src: data.imageUrl, alt: data.name || '' }];
        }

        setForm({
          name: data.name || '',
          description: data.description || '',
          groups: data.groups || [],
          subGroups: data.subGroups || [],
          imageUrl: data.imageUrl || '',       // legacy
          thumbnailUrl: data.thumbnailUrl || '', // legacy
          images: imagesArr,                   // unified gallery
          youtubeUrl: data.youtubeUrl || ''
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

  const handleRemoveExistingImage = (idx) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      let newImageUrl = form.imageUrl;
      let newThumbUrl = form.thumbnailUrl;

      // If user chose new main full image, upload it and update legacy + first slide
      if (fullFile) {
        const fullUrl = await uploadToStorage('images', fullFile);
        newImageUrl = fullUrl;

        // ensure first slide reflects the new main image
        let nextImages = [...form.images];
        if (nextImages.length) {
          nextImages[0] = { src: fullUrl, alt: form.name || nextImages[0].alt || '' };
        } else {
          nextImages = [{ src: fullUrl, alt: form.name || '' }];
        }
        setForm(prev => ({ ...prev, images: nextImages })); // keep local state in sync
      }

      // If user chose new thumbnail
      if (thumbFile) {
        const thumbUrl = await uploadToStorage('thumbnails', thumbFile);
        newThumbUrl = thumbUrl;
      }

      // Upload any newly added gallery files (append to end)
      const uploadedNew = [];
      for (const f of newGalleryFiles) {
        const url = await uploadToStorage('images', f);
        uploadedNew.push({ src: url, alt: `${form.name || 'image'} (extra)` });
      }

      // Build final images[] (after possible main image change & removals)
      let finalImages = form.images;
      if (uploadedNew.length) {
        finalImages = [...finalImages, ...uploadedNew];
      }

      // Compose update object
      const updatedItem = {
        name: form.name,
        description: form.description,
        groups: form.groups,
        subGroups: form.subGroups,
        imageUrl: newImageUrl,     // legacy
        thumbnailUrl: newThumbUrl, // legacy
        images: finalImages        // NEW unified gallery
      };

      if (form.youtubeUrl?.trim()) {
        updatedItem.youtubeUrl = form.youtubeUrl.trim();
      } else {
        // If you want to remove the field when cleared, uncomment next line:
        // updatedItem.youtubeUrl = firebase.firestore.FieldValue.delete();
      }

      const docRef = doc(db, 'images', id);
      await updateDoc(docRef, updatedItem);

      alert('Item updated successfully!');
      navigate('/items');
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Error updating item. See console for details.');
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

      <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
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

        {/* Legacy Full image (main) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-semibold">Full Image (main):</label>
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
            <p className="text-xs text-gray-600 mt-1">If you choose a new main image, it will replace the first slide and legacy full image.</p>
          </div>

          {/* Legacy Thumbnail */}
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
        </div>

        {/* NEW: Existing gallery preview with remove controls */}
        <div>
          <label className="block mb-2 font-semibold">Gallery Images:</label>
          {form.images?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {form.images.map((img, idx) => (
                <div key={`${img.src}-${idx}`} className="border rounded p-2 text-center">
                  <img
                    src={img.src}
                    alt={img.alt || `image ${idx + 1}`}
                    className="h-32 w-full object-contain mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                    disabled={form.images.length === 1 && idx === 0}
                    title={form.images.length === 1 && idx === 0 ? "Cannot remove the only image" : "Remove this image"}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No gallery images yet.</p>
          )}
          <p className="text-xs text-gray-600 mt-1">Tip: keep at least one image.</p>
        </div>

        {/* NEW: Add more gallery images */}
        <div>
          <label className="block mb-1 font-semibold">Add More Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => setNewGalleryFiles(Array.from(e.target.files))}
            className="block"
          />
          <p className="text-xs text-gray-600 mt-1">You can select multiple files; they’ll be appended to the end of the gallery.</p>
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

