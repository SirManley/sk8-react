// src/components/ImageModal.jsx
import React, { useState, useEffect } from 'react';
import '../App.css';

export default function ImageModal({ item, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setShowVideo(false);
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
    setOffsetX((x / rect.width) * 100);
    setOffsetY((y / rect.height) * 100);
    changeZoom(delta);
  };

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setOffsetX((x / rect.width) * 100);
    setOffsetY((y / rect.height) * 100);
  };

  return (
    <div
      id="lightbox"
      className={`lightbox ${item ? 'show' : ''}`}
      onClick={onClose}
    >
      <span className="close" onClick={onClose}>&times;</span>

      {/* Controls */}
      <div className="lightbox-controls" onClick={e => e.stopPropagation()}>
        <button onClick={() => changeZoom(0.2)}>＋</button>
        <button onClick={() => changeZoom(-0.2)}>－</button>
        <button onClick={() => setZoom(1)}>⟳</button>
        {item.youtubeUrl && (
          <button onClick={() => setShowVideo(true)} className="media-button">
            ▶ Media
          </button>
        )}
      </div>

      {/* Image */}
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

      {/* Caption */}
      {item.description && <div id="caption">{item.description}</div>}

      {/* YouTube Video Modal */}
      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              width="560"
              height="315"
              src={item.youtubeUrl.replace('watch?v=', 'embed/')}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button className="close-button" onClick={() => setShowVideo(false)}>
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


