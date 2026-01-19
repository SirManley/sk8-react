// src/pages/Stories/StoryDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../../firebase";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

export default function StoryDetail() {
  const { slug } = useParams();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "stories"),
          where("slug", "==", slug),
          limit(1)
        );
        const snap = await getDocs(q);
        const docSnap = snap.docs[0];
        setStory(docSnap ? { id: docSnap.id, ...docSnap.data() } : null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  // ✅ Hooks must be above any early return
  const hasGallery = Array.isArray(story?.images) && story.images.length > 0;

  const slides = useMemo(() => {
    if (!hasGallery) return [];
    return story.images
      .filter((img) => img?.url)
      .map((img, idx) => ({
        src: img.url,
        title: story?.title || "Gallery",
        description: img.caption || `Image ${idx + 1}`,
      }));
  }, [hasGallery, story]);

  function openGalleryLightbox(startIndex = 0) {
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  }

  const wrapperStyle = {
    width: "80%",
    margin: "0 auto",
    padding: "0 1rem",
    textAlign: "center",
  };

  const maxW3xl = { width: "100%", maxWidth: 768, margin: "0 auto" };
  const maxW4xl = { width: "100%", maxWidth: 896, margin: "0 auto" };
  const maxW5xl = { width: "100%", maxWidth: 1024, margin: "0 auto" };

  // Early returns now happen AFTER hooks
  if (loading) {
    return (
      <div style={wrapperStyle}>
        <p>Loading story…</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={wrapperStyle}>
        <p style={{ marginBottom: 16 }}>Story not found.</p>
        <Link
          to="/stories"
          style={{ color: "#3b82f6", textDecoration: "underline" }}
        >
          ← Back to Stories
        </Link>
      </div>
    );
  }

  const publishedDate =
    story.publishedAt?.toDate?.() &&
    story.publishedAt.toDate().toLocaleDateString();

  return (
    <div style={wrapperStyle}>
      {/* Back link */}
      <div style={{ ...maxW3xl, marginBottom: 24 }}>
        <Link
          to="/stories"
          style={{ color: "#3b82f6", textDecoration: "underline" }}
        >
          ← Back to Stories
        </Link>
      </div>

      {/* Title */}
      <h1
        style={{
          ...maxW3xl,
          fontSize: "2rem",
          fontWeight: 800,
          marginBottom: 8,
        }}
      >
        {story.title}
      </h1>

      {/* Date + tags */}
      {(publishedDate || (Array.isArray(story.tags) && story.tags.length > 0)) && (
        <div
          style={{
            ...maxW3xl,
            fontSize: "0.9rem",
            color: "#4b5563",
            marginBottom: 24,
          }}
        >
          {publishedDate && <span>{publishedDate}</span>}
          {publishedDate && story.tags?.length > 0 && <span> • </span>}
          {Array.isArray(story.tags) && story.tags.length > 0 && (
            <span>{story.tags.join(" • ")}</span>
          )}
        </div>
      )}

      {/* Cover */}
      {story.coverImageUrl && (
        <div
          style={{
            ...maxW4xl,
            marginBottom: 32,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={story.coverImageUrl}
            alt={story.title}
            style={{
              maxWidth: "100%",
              maxHeight: 420,
              objectFit: "contain",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
          />
        </div>
      )}

      {/* Body */}
      {story.content && (
        <div
          style={{
            ...maxW3xl,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            padding: 24,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              fontSize: "1.05rem",
            }}
          >
            {story.content}
          </div>
        </div>
      )}

      {/* Gallery */}
      {hasGallery && (
        <div
          style={{
            ...maxW5xl,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 24 }}>
            Gallery
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "2rem",
              justifyItems: "center",
            }}
          >
            {story.images.map((img, idx) => (
              <figure key={idx} style={{ maxWidth: 420, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => openGalleryLightbox(idx)}
                  style={{
                    border: "none",
                    padding: 0,
                    background: "transparent",
                    cursor: "zoom-in",
                    width: "100%",
                  }}
                  aria-label={`Open image ${idx + 1} in lightbox`}
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Story image ${idx + 1}`}
                    style={{
                      width: "100%",
                      maxHeight: 360,
                      objectFit: "contain",
                      borderRadius: 10,
                      background: "#f3f4f6",
                      padding: 10,
                    }}
                    loading="lazy"
                  />
                </button>

                {img.caption && (
                  <figcaption
                    style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: 8 }}
                  >
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {hasGallery && (
<Lightbox
  open={lightboxOpen}
  close={() => setLightboxOpen(false)}
  index={lightboxIndex}
  slides={slides}
  plugins={[Zoom, Captions, Fullscreen, Thumbnails]}
  carousel={{
    finite: false,
    preload: 2,
  }}
  animation={{
    fade: 250,
    swipe: 250,
  }}
  zoom={{
    maxZoomPixelRatio: 4,
    zoomInMultiplier: 1.6,
    scrollToZoom: true,
    wheelZoomDistanceFactor: 100,
    pinchZoomDistanceFactor: 100,
    doubleTapDelay: 250,
    doubleClickDelay: 250,
  }}
  thumbnails={{
    position: "start",     // ⬅️ LEFT SIDE vertical film strip
    width: 110,
    height: 70,
    gap: 10,
    padding: 8,
    border: 2,
    vignette: false,
  }}

/>


      )}
    </div>
  );
}


