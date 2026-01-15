// src/pages/AdminStories.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";

export default function AdminStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "stories"), orderBy("updatedAt", "desc"));
      const snap = await getDocs(q);
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (storyId) => {
    const ok = window.confirm("Delete this story? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "stories", storyId));
      await load();
    } catch (e) {
      console.error(e);
      alert("Delete failed. Check console.");
    }
  };

  return (
    <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
      <div className="w-4/5 mx-auto px-4">
        <div className="mb-4">
          <Link to="/admin" className="text-blue-500 underline">
            ← Back to Admin
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-center">Manage Stories</h1>

        {loading && <p className="text-center">Loading…</p>}

        {!loading && stories.length === 0 && (
          <p className="text-center text-gray-600">No stories yet.</p>
        )}

        {!loading && stories.length > 0 && (
          <div className="space-y-3">
            {stories.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded shadow p-3 flex items-center justify-between gap-4"
              >
                {/* ✅ Cover Thumbnail + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="bg-gray-100 rounded overflow-hidden flex items-center justify-center"
                    style={{ width: 72, height: 72, flex: "0 0 72px" }}
                  >
                    {s.coverImageUrl ? (
                      <img
                        src={s.coverImageUrl}
                        alt={s.title || "story cover"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-500 text-center px-1">
                        No cover
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {s.title || "(untitled)"}
                    </div>

                    <div className="text-xs text-gray-600 truncate">
                      Status:{" "}
                      <span className="font-mono">{s.status || "draft"}</span>{" "}
                      • Slug: <span className="font-mono">{s.slug || "-"}</span>
                    </div>

                    {/* Optional: tiny helper line */}
                    {s.updatedAt && (
                      <div className="text-xs text-gray-500 truncate">
                        Updated:{" "}
                        {s.updatedAt?.toDate?.()
                          ? s.updatedAt.toDate().toLocaleString()
                          : String(s.updatedAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    to={`/admin/stories/${s.id}`}
                    className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => onDelete(s.id)}
                    className="border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}


