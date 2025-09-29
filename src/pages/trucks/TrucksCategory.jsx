// src/pages/trucks/TrucksCategory.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { subGroupMap } from "../../data/subGroupMap";

import MediaLightbox from "../../components/MediaLightbox";
import { mapItemToSlides } from "../../utils/mapItemToSlides";

export default function TrucksCategory() {
  const { category } = useParams();
  const group = "trucks";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeSlides, setActiveSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function openItemLightbox(item, startIndex = 0) {
    const slides = mapItemToSlides(item);
    if (!slides.length) return;
    setActiveSlides(slides);
    setActiveIndex(startIndex);
    setLightboxOpen(true);
  }

  useEffect(() => {
    async function fetchByCategory() {
      setLoading(true);
      const mapKey = `${group}/${category}`;
      const tagToQuery = subGroupMap[mapKey] || category;

      try {
        const q = query(
          collection(db, "images"),
          where("subGroups", "array-contains", tagToQuery)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Only keep docs in Trucks group
        const filtered = docs.filter(
          (item) => Array.isArray(item.groups) && item.groups.includes("Trucks")
        );

        setItems(filtered);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    if (category) fetchByCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]); // group is a constant string

  const displayLabel =
    category === "complete-collection"
      ? "All Trucks"
      : category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  if (loading) return <p className="text-center">Loading {displayLabel}…</p>;
  if (!items.length)
    return <p className="text-center">No trucks found for “{displayLabel}.”</p>;

  return (
    <>
      <div className="w-4/5 mx-auto px-4">
        <h2 className="mb-4 text-2xl font-semibold text-center capitalize">
          {displayLabel}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "6rem",
            justifyItems: "center",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${item.name} images`}
              onClick={() => openItemLightbox(item, 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openItemLightbox(item, 0);
                }
              }}
              className="
                cursor-pointer
                bg-white rounded overflow-hidden shadow
                hover:shadow-lg transition p-2 flex flex-col items-center
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              "
            >
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                style={{
                  maxHeight: "14rem",
                  width: "100%",
                  objectFit: "contain",
                }}
                loading="lazy"
              />
              {item.name && (
                <p className="mt-2 text-center text-sm font-medium text-gray-800">
                  {item.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Single all-in-one lightbox */}
      <MediaLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        slides={activeSlides}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        showCaptions={true}
        enableFullscreen={true}
      />
    </>
  );
}
