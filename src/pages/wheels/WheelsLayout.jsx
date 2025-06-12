// src/pages/wheels/WheelsLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ImageModal from '../../components/ImageModal';

export default function WheelsLayout() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* This lightbox lives at the root so it truly overlays everything */}
      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Your normal page content */}
      <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
        <Outlet context={{ setSelectedItem }} />
      </main>
    </>
  );
}
