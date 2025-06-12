// src/components/ImageModal.jsx
import React, { useState, useEffect } from 'react';
import '../index.css'; // ensure your global CSS is imported

export default function ImageModal({ item, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // reset zoom whenever a new item opens
  useEffect(() => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }, [item]);

  if (!item) return null;

  const src =
    item.fullImageUrl ||
    item.imageUrl ||
    item.url ||
    item.fullImage ||
    item.thumbnailUrl ||
    '';

  const changeZoom = delta => {
    setZoom(z => Math.min(Math.max(z + delta, 1), 3));
  };

  const handleMouseWheel = e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setOffsetX(x / rect.width * 100);
    setOffsetY(y / rect.height * 100);
    changeZoom(delta);
  };

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setOffsetX(x / rect.width * 100);
    setOffsetY(y / rect.height * 100);
  };

  return (
    <div
      id="lightbox"
      className={`lightbox ${item ? 'show' : ''}`}
      onClick={onClose}
    >
      <span className="close" onClick={onClose}>&times;</span>

      {/* Zoom controls */}
      <div className="lightbox-controls" onClick={e => e.stopPropagation()}>
        <button onClick={() => changeZoom(0.2)}>＋</button>
        <button onClick={() => changeZoom(-0.2)}>－</button>
        <button onClick={() => setZoom(1)}>⟳</button>
      </div>

      <img
        className="lightbox-content"
        id="lightbox-img"
        src={src}
        alt={item.name}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${offsetX}% ${offsetY}%`
        }}
        onWheel={handleMouseWheel}
        onMouseMove={handleMouseMove}
      />

      {item.description && (
        <div id="caption">{item.description}</div>
      )}
    </div>
  );
}
