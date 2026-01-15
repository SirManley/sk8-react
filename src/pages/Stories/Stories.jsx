// src/pages/Stories.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const q = query(
          collection(db, "stories"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc")
        );

        const snap = await getDocs(q);
        setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Stories query failed:", err);

        const msg = String(err?.message || "");

        // ✅ Silent fallback if composite index isn't ready
        if (msg.includes("requires an index")) {
          try {
            const fallbackQ = query(
              collection(db, "stories"),
              orderBy("createdAt", "desc")
            );

            const snap = await getDocs(fallbackQ);

            const publishedOnly = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((s) => s.status === "published");

            // Sort newest-first: prefer publishedAt, fallback to createdAt
            publishedOnly.sort((a, b) => {
              const aTime =
                a.publishedAt?.toDate?.()?.getTime?.() ??
                new Date(a.publishedAt || a.createdAt || 0).getTime();

              const bTime =
                b.publishedAt?.toDate?.()?.getTime?.() ??
                new Date(b.publishedAt || b.createdAt || 0).getTime();

              return bTime - aTime;
            });

            setStories(publishedOnly);
            return;
          } catch (fallbackErr) {
            console.error("Fallback stories query failed:", fallbackErr);
            setStories([]);
            setError("Could not load stories.");
            return;
          }
        }

        setStories([]);
        setError("Could not load stories.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    // ✅ MATCHES TrucksLayout wrapper so it centers the same way
    <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
      {/* Inner width wrapper (like TrucksCategory uses w-4/5 mx-auto) */}
      <div className="w-4/5 mx-auto px-4">
        <h1 className="mb-2 text-3xl font-bold text-center">Stories</h1>
        <p className="text-center text-gray-600 mb-8">
          Finds, memories, restorations, and all the weird little moments that come with collecting.
        </p>

        {loading && <p className="text-center">Loading stories…</p>}
        {!loading && error && <p className="text-center">{error}</p>}

        {!loading && !error && (
          <>
            {stories.length === 0 ? (
              <p className="text-center text-gray-600">No published stories yet.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "3rem",
                  justifyItems: "center",
                }}
              >
                {stories.map((s) => (
                  <Link
                    key={s.id}
                    to={`/stories/${s.slug}`}
                    className="
                      cursor-pointer
                      bg-white rounded overflow-hidden shadow
                      hover:shadow-lg transition p-2 flex flex-col items-center
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                      w-full
                    "
                    style={{ maxWidth: 360 }}
                  >
                    {s.coverImageUrl && (
                      <img
                        src={s.coverImageUrl}
                        alt={s.title}
                        style={{
                          maxHeight: "14rem",
                          width: "100%",
                          objectFit: "contain",
                        }}
                        loading="lazy"
                      />
                    )}

                    <div className="mt-2 text-center">
                      <h2 className="text-lg font-semibold text-gray-800">{s.title}</h2>

                      {Array.isArray(s.tags) && s.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                          {s.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}



