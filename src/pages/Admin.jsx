// src/pages/Admin.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";

const GROUPS = {
  Skateboards: [
    "Old-School",
    "New-School",
    "Shaped",
    "Freestyle",
    "Mike-McGill",
    "Tony-Hawk",
    "All-Skateboards",
  ],
  Trucks: [
    "Old-School",
    "New-School",
    "Independent",
    "Grind King",
    "Tracker",
    "Thunder",
    "Venture",
    "Other",
    "All-Trucks",
  ],
  Wheels: [
    "Old-School",
    "New-School",
    "Powell",
    "Bones",
    "Spitfire",
    "OJ",
    "Other",
    "All-Wheels",
  ],
  "Soft-Goods": ["Apparel", "Safety-Gear", "Patches"],
  Accessories: [
    "Bearings",
    "Grip-Tape",
    "Hardware",
    "Rails",
    "Plastic-Guards",
    "Risers",
    "Tools",
    "Other",
    "All-Accessories",
  ],
  Apparel: ["Shirts", "Shoes", "Hats", "Pants", "Other", "All-Apparel"],
  Memorabilia: [
    "Stickers",
    "Patches",
    "Pins",
    "Posters",
    "Magazines",
    "Media",
    "Other",
    "All-Memorabilia",
  ],
  Protective: [
    "Helmets",
    "Elbow",
    "Knee",
    "Ankle",
    "Wrist",
    "Hand",
    "Other",
    "All-Protective",
  ],
};

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Admin() {
  // =========================
  // EXISTING ITEM FORM STATE
  // =========================
  const [form, setForm] = useState({
    name: "",
    description: "",
    groups: [],
    subGroups: [],
    youtubeUrl: "",
  });

  const [fullFile, setFullFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  // =========================
  // STORY FORM STATE
  // =========================
  const [storyForm, setStoryForm] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    status: "draft", // draft | published
  });

  const computedSlug = useMemo(() => {
    return storyForm.slug?.trim()
      ? slugify(storyForm.slug)
      : slugify(storyForm.title);
  }, [storyForm.slug, storyForm.title]);

  const [storyCoverFile, setStoryCoverFile] = useState(null);

  // ✅ We store gallery as an array of { file, caption }
  const [storyGallery, setStoryGallery] = useState([]); // [{file, caption}]
  const [busyStory, setBusyStory] = useState(false);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = "/login";
    });
  };

  // =========================
  // ITEM CHANGE HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "groups") {
        const parent = value;
        if (checked) {
          const allSub = GROUPS[parent].find((s) => s.startsWith("All-"));
          setForm((prev) => ({
            ...prev,
            groups: [...prev.groups, parent],
            subGroups: allSub
              ? [...new Set([...prev.subGroups, allSub])]
              : prev.subGroups,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            groups: prev.groups.filter((g) => g !== parent),
            subGroups: prev.subGroups.filter(
              (sub) => !GROUPS[parent].includes(sub)
            ),
          }));
        }
      } else if (name === "subGroups") {
        setForm((prev) => ({
          ...prev,
          subGroups: checked
            ? [...prev.subGroups, value]
            : prev.subGroups.filter((s) => s !== value),
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // =========================
  // STORY CHANGE HANDLERS
  // =========================
  const handleStoryChange = (e) => {
    const { name, value } = e.target;
    setStoryForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Append new gallery files (don’t replace)
  const addStoryGalleryFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setStoryGallery((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, caption: "" })),
    ]);
  };

  const updateStoryGalleryCaption = (idx, caption) => {
    setStoryGallery((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], caption };
      return next;
    });
  };

  const removeStoryGalleryItem = (idx) => {
    setStoryGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  // =========================
  // SHARED UPLOAD HELPER
  // =========================
  const uploadToStorage = async (pathPrefix, file) => {
    const safeName = `${Date.now()}-${file.name}`;
    const storagePath = `${pathPrefix}/${safeName}`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, storagePath };
  };

  // =========================
  // ITEM UPLOAD
  // =========================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fullFile || !thumbFile) return alert("Select both images first.");

    const full = await uploadToStorage("images", fullFile);
    const thumb = await uploadToStorage("thumbnails", thumbFile);

    const extraUrls = [];
    for (const f of extraFiles) {
      if (!f) continue;
      const up = await uploadToStorage("images", f);
      extraUrls.push(up.url);
    }

    const images = [{ src: full.url, alt: form.name }];
    extraUrls.forEach((u, i) =>
      images.push({ src: u, alt: `${form.name} (extra ${i + 1})` })
    );

    const newItem = {
      name: form.name,
      description: form.description,
      imageUrl: full.url,
      thumbnailUrl: thumb.url,
      images,
      groups: form.groups,
      subGroups: form.subGroups,
      createdAt: new Date(),
    };

    if (form.youtubeUrl?.trim()) {
      newItem.youtubeUrl = form.youtubeUrl.trim();
    }

    await addDoc(collection(db, "images"), newItem);

    alert("Item uploaded successfully!");
    setForm({ name: "", description: "", groups: [], subGroups: [], youtubeUrl: "" });
    setFullFile(null);
    setThumbFile(null);
    setExtraFiles([]);
  };

  // =========================
  // STORY CREATE
  // =========================
  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!storyForm.title.trim()) return alert("Story title is required.");
    if (!storyCoverFile) return alert("Please select a cover image.");

    setBusyStory(true);
    try {
      // 1) Upload cover
      const cover = await uploadToStorage("stories/covers", storyCoverFile);

      // 2) Upload gallery
      const gallery = [];
      for (let i = 0; i < storyGallery.length; i++) {
        const { file, caption } = storyGallery[i];
        if (!file) continue;
        const up = await uploadToStorage("stories/images", file);
        gallery.push({
          url: up.url,
          storagePath: up.storagePath, // ✅ for future delete
          caption: (caption || "").trim(),
        });
      }

      // 3) Parse tags CSV
      const tags = (storyForm.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const status = storyForm.status === "published" ? "published" : "draft";

      const storyDoc = {
        title: storyForm.title.trim(),
        slug: computedSlug,
        content: storyForm.content,
        tags,
        status,

        coverImageUrl: cover.url,
        coverStoragePath: cover.storagePath, // ✅ for future delete
        images: gallery,

        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: status === "published" ? new Date() : null,
      };

      await addDoc(collection(db, "stories"), storyDoc);

      alert("Story saved!");
      setStoryForm({ title: "", slug: "", content: "", tags: "", status: "draft" });
      setStoryCoverFile(null);
      setStoryGallery([]);
    } catch (err) {
      console.error(err);
      alert("Something went wrong saving the story. Check console.");
    } finally {
      setBusyStory(false);
    }
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

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="mb-4">
          <Link
            to="/items"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-fit"
          >
            View All Uploaded Items
          </Link>
        </div>

        <div>
          <Link
            to="/admin/stories"
            className="inline-block bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded w-fit"
          >
            Manage Stories (Edit/Delete)
          </Link>
        </div>
      </div>

      {/* ITEM UPLOAD */}
      <section className="mb-10 border rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Upload Item</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block mb-1"><strong>Name:</strong></label>
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
            <label className="block mb-1"><strong>Description:</strong></label>
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
              onChange={(e) => setFullFile(e.target.files[0])}
              required
              className="block"
            />
          </div>

          <div>
            <label className="block mb-1">Thumbnail:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbFile(e.target.files[0])}
              required
              className="block"
            />
          </div>

          <div>
            <label className="block mb-1">Additional Images (optional):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setExtraFiles(Array.from(e.target.files))}
              className="block"
            />
            <p className="text-xs text-gray-600 mt-1">
              You can select multiple files. These will appear as extra slides in the lightbox.
            </p>
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
                    {subArr.map((subName) => (
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
                        <span className={parentIsChecked ? "text-gray-700" : "text-gray-400"}>
                          {subName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

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
      </section>

      {/* STORY CREATOR */}
      <section className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Create Story</h2>

        <form onSubmit={handleStorySubmit} className="space-y-4">
          <div>
            <label className="block mb-1"><strong>Title:</strong></label>
            <input
              type="text"
              name="title"
              value={storyForm.title}
              onChange={handleStoryChange}
              className="border p-2 w-full"
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              URL slug: <span className="font-mono">{computedSlug || "(type a title)"}</span>
            </p>
          </div>

          <div>
            <label className="block mb-1">Custom Slug (optional):</label>
            <input
              type="text"
              name="slug"
              value={storyForm.slug}
              onChange={handleStoryChange}
              placeholder="leave blank to auto-generate from title"
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-1"><strong>Story Body:</strong></label>
            <textarea
              name="content"
              value={storyForm.content}
              onChange={handleStoryChange}
              className="border p-2 w-full"
              rows={10}
              placeholder="Write the full story here…"
            />
          </div>

          <div>
            <label className="block mb-1">Tags (comma separated):</label>
            <input
              type="text"
              name="tags"
              value={storyForm.tags}
              onChange={handleStoryChange}
              className="border p-2 w-full"
              placeholder="Powell, Hawk, Thrift score"
            />
          </div>

          <div>
            <label className="block mb-1">Status:</label>
            <select
              name="status"
              value={storyForm.status}
              onChange={handleStoryChange}
              className="border p-2 w-full"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block mb-1"><strong>Cover Image:</strong></label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setStoryCoverFile(e.target.files[0])}
              className="block"
              required
            />
          </div>

          {/* ✅ Gallery: add more, remove, captions */}
          <div>
            <label className="block mb-1">Gallery Images (optional):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addStoryGalleryFiles(e.target.files)}
              className="block"
            />
            <p className="text-xs text-gray-600 mt-1">
              Tip: You can pick some now, then pick more later — they’ll append.
            </p>

            {storyGallery.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold">Captions (optional):</p>

                {storyGallery.map((g, idx) => (
                  <div key={`${g.file.name}-${idx}`} className="border rounded p-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-600">
                        {idx + 1}. {g.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStoryGalleryItem(idx)}
                        className="text-xs text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={g.caption}
                      onChange={(e) => updateStoryGalleryCaption(idx, e.target.value)}
                      className="border p-2 w-full mt-2"
                      placeholder="Caption for this image…"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busyStory}
            className={`text-white px-4 py-2 rounded ${
              busyStory ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {busyStory ? "Saving…" : "Save Story"}
          </button>
        </form>
      </section>
    </main>
  );
}

