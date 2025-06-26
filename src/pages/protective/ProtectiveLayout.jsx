import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ImageModal from '../../components/ImageModal';

export default function ProtectiveLayout() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* Lightbox overlay */}
      <ImageModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Main page container */}
      <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
        {/* renders ProtectiveHome (at /protective) or ProtectiveCategory (at /protective/:category) */}
        <Outlet context={{ setSelectedItem }} />
      </main>
    </>
  );
}
