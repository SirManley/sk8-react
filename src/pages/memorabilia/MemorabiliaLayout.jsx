import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ImageModal from '../../components/ImageModal';

export default function MemorabiliaLayout() {
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
        {/* renders MemorabiliaHome (at /memorabilia) or MemorabiliaCategory (at /memorabilia/:category) */}
        <Outlet context={{ setSelectedItem }} />
      </main>
    </>
  );
}

