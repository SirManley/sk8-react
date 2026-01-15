// src/pages/EditStory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadToStorage(pathPrefix, file) {
  const safeName = `${Date.now()}-${file.name}`;
  const storagePath = `${pathPrefix}/${safeName}`;
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { url, storagePath };
}

// Convert Date -> "YYYY-MM-DD" for <input type="date">
function toYyyyMmDd(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

// Parse Firestore Timestamp OR Date OR string -> Date (best effort)
function coerceToDate(v) {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate(); // Firestore Timestamp
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export default function EditStory() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    tags: "",
    status: "draft",
  });

  const computedSlug = useMemo(() => {
    return form.slug?.trim() ? slugify(form.slug) : slugify(form.title);
  }, [form.slug, form.title]);

  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [existingCoverPath, setExistingCoverPath] = useState("");
  const [removeCover, setRemoveCover] = useState(false);
  const [newCoverFile, setNewCoverFile] = useState(null);

  const [existingGallery, setExistingGallery] = useState([]);
  const [newGallery, setNewGallery] = useState([]); // [{file, caption}]

  // ✅ Published date editing (edit-only)
  const [publishedDate, setPublishedDate] = useState(""); // "YYYY-MM-DD"
  const [originalPublishedDate, setOriginalPublishedDate] = useState(""); // compare to detect change

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "stories", id));
        if (!snap.exists()) {
          nav("/admin/stories");
          return;
        }

        const s = snap.data();

        setForm({
          title: s.title || "",
          slug: s.slug || "",
          content: s.content || "",
          tags: Array.isArray(s.tags) ? s.tags.join(", ") : "",
          status: s.status === "published" ? "published" : "draft",
        });

        setExistingCoverUrl(s.coverImageUrl || "");
        setExistingCoverPath(s.coverStoragePath || "");
        setExistingGallery(Array.isArray(s.images) ? s.images : []);

        // ✅ Load publishedAt into the date picker (auto-filled)
        const publishedAtDate = coerceToDate(s.publishedAt);
        const dateString = publishedAtDate ? toYyyyMmDd(publishedAtDate) : "";

        // If story is published but has no date, default to today (rare but safe)
        const initialDate =
          s.status === "published" && !dateString ? toYyyyMmDd(new Date()) : dateString;

        setPublishedDate(initialDate);
        setOriginalPublishedDate(initialDate);
      } catch (e) {
        console.error(e);
        nav("/admin/stories");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, nav]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const updateExistingCaption = (idx, caption) => {
    setExistingGallery((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], caption };
      return next;
    });
  };

  const removeExistingGalleryItem = (idx) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const addNewGalleryFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setNewGallery((prev) => [...prev, ...files.map((f) => ({ file: f, caption: "" }))]);
  };

  const updateNewCaption = (idx, caption) => {
    setNewGallery((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], caption };
      return next;
    });
  };

  const removeNewGalleryItem = (idx) => {
    setNewGallery((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required.");

    setBusy(true);
    try {
      let coverImageUrl = existingCoverUrl;
      let coverStoragePath = existingCoverPath;

      if (removeCover) {
        coverImageUrl = "";
        coverStoragePath = "";
      }

      if (newCoverFile) {
        const up = await uploadToStorage("stories/covers", newCoverFile);
        coverImageUrl = up.url;
        coverStoragePath = up.storagePath;
      }

      const uploadedNewGallery = [];
      for (let i = 0; i < newGallery.length; i++) {
        const { file, caption } = newGallery[i];
        if (!file) continue;
        const up = await uploadToStorage("stories/images", file);
        uploadedNewGallery.push({
          url: up.url,
          storagePath: up.storagePath,
          caption: (caption || "").trim(),
        });
      }

      const tags = (form.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const status = form.status === "published" ? "published" : "draft";

      const nextImages = [
        ...(Array.isArray(existingGallery) ? existingGallery : []),
        ...uploadedNewGallery,
      ];

      // ✅ Build update payload ONCE
      const updatePayload = {
        title: form.title.trim(),
        slug: computedSlug,
        content: form.content,
        tags,
        status,
        coverImageUrl,
        coverStoragePath,
        images: nextImages,
        updatedAt: new Date(),
      };

      // ✅ Published date rules:
      // - draft => publishedAt null
      // - published => ONLY update if user changed the date
      // - published and missing date => set once (now)
      if (status === "draft") {
        updatePayload.publishedAt = null;
      } else if (status === "published") {
        const dateChanged = publishedDate !== originalPublishedDate;

        if (dateChanged) {
          // Noon local time avoids timezone shifting to previous day
          updatePayload.publishedAt = new Date(`${publishedDate}T12:00:00`);
        } else if (!originalPublishedDate) {
          // Published but missing a saved date → set once
          updatePayload.publishedAt = new Date();
          const nowStr = toYyyyMmDd(new Date());
          setPublishedDate(nowStr);
          setOriginalPublishedDate(nowStr);
        }
        // else: do nothing (preserve existing publishedAt)
      }

      await updateDoc(doc(db, "stories", id), updatePayload);

      alert("Story updated!");
      nav("/admin/stories");
    } catch (e2) {
      console.error(e2);
      alert("Save failed. Check console.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
        <p className="text-center">Loading…</p>
      </main>
    );
  }

  return (
    <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
      <div className="w-4/5 mx-auto px-4">
        <div className="mb-4">
          <Link to="/admin/stories" className="text-blue-500 underline">
            ← Back to Manage Stories
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-center">Edit Story</h1>

        <form onSubmit={onSave} className="bg-white rounded shadow p-4 space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="border p-2 w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              URL slug: <span className="font-mono">{computedSlug}</span>
            </p>
          </div>

          <div>
            <label className="block mb-1">Custom Slug (optional)</label>
            <input
              name="slug"
              value={form.slug}
              onChange={onChange}
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Story Body</label>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              className="border p-2 w-full"
              rows={10}
            />
          </div>

          <div>
            <label className="block mb-1">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={onChange}
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="border p-2 w-full"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* ✅ Edit Published Date (only meaningful when published) */}
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Published Date</div>

            <div className="text-sm text-gray-600 mb-2">
              Defaults to the saved published date. Change it only when you want to stagger posts.
            </div>

            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className="border p-2"
              disabled={form.status !== "published"}
              title={form.status !== "published" ? "Set status to Published to edit date" : ""}
            />

            {form.status !== "published" && (
              <div className="text-xs text-gray-500 mt-2">
                Set Status to <b>Published</b> to edit the published date. Draft stories have no published date.
              </div>
            )}

            {form.status === "published" && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  className="border px-3 py-1 rounded text-sm"
                  onClick={() => setPublishedDate(toYyyyMmDd(new Date()))}
                >
                  Set to Today
                </button>

                <button
                  type="button"
                  className="border px-3 py-1 rounded text-sm"
                  onClick={() => setPublishedDate(originalPublishedDate)}
                  disabled={!originalPublishedDate}
                  title={!originalPublishedDate ? "No saved date to revert to" : ""}
                >
                  Revert to Saved Date
                </button>
              </div>
            )}
          </div>

          {/* COVER */}
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Cover Image</div>

            {existingCoverUrl && !removeCover && (
              <div className="mb-2">
                <img
                  src={existingCoverUrl}
                  alt="cover"
                  style={{ maxHeight: 220, width: "100%", objectFit: "contain" }}
                />
              </div>
            )}

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removeCover}
                onChange={(e) => setRemoveCover(e.target.checked)}
              />
              Remove cover image
            </label>

            <div className="mt-3">
              <label className="block mb-1 text-sm">Replace cover (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewCoverFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* EXISTING GALLERY */}
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Gallery (Existing)</div>

            {existingGallery.length === 0 && (
              <p className="text-sm text-gray-600">No gallery images yet.</p>
            )}

            {existingGallery.length > 0 && (
              <div className="space-y-3">
                {existingGallery.map((img, idx) => (
                  <div key={`${img.url}-${idx}`} className="border rounded p-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-600">Image {idx + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryItem(idx)}
                        className="text-xs text-red-600 underline"
                      >
                        Remove from story
                      </button>
                    </div>

                    <div className="mt-2">
                      <img
                        src={img.url}
                        alt={img.caption || `gallery-${idx + 1}`}
                        style={{
                          maxHeight: 220,
                          width: "100%",
                          objectFit: "contain",
                          background: "#f3f4f6",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      />
                    </div>

                    <input
                      type="text"
                      className="border p-2 w-full mt-2"
                      value={img.caption || ""}
                      onChange={(e) => updateExistingCaption(idx, e.target.value)}
                      placeholder="Caption (optional)"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW GALLERY */}
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Add Gallery Images</div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addNewGalleryFiles(e.target.files)}
            />

            {newGallery.length > 0 && (
              <div className="mt-3 space-y-2">
                {newGallery.map((g, idx) => (
                  <div key={`${g.file.name}-${idx}`} className="border rounded p-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-600">
                        {idx + 1}. {g.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewGalleryItem(idx)}
                        className="text-xs text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      className="border p-2 w-full mt-2"
                      value={g.caption}
                      onChange={(e) => updateNewCaption(idx, e.target.value)}
                      placeholder="Caption (optional)"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className={`text-white px-4 py-2 rounded ${
              busy ? "bg-gray-400" : "bg-slate-700 hover:bg-slate-800"
            }`}
          >
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
