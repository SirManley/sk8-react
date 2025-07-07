import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import SubHeaderNav from '../components/SubHeaderNav';
import Footer from '../components/Footer';
import ImageModal from '../components/ImageModal'; // Your zoom popup component

export default function MainLayout() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // ✅ modal state
  const location = useLocation();

  const showSubHeader =
    location.pathname.startsWith('/skateboards') ||
    location.pathname.startsWith('/wheels') ||
    location.pathname.startsWith('/accessories') ||
    location.pathname.startsWith('/apparel') ||
    location.pathname.startsWith('/memorabilia') ||
    location.pathname.startsWith('/protective') ||
    location.pathname.startsWith('/trucks');

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav setSelectedGroup={setSelectedGroup} />

      {showSubHeader ? (
        <SubHeaderNav selectedGroup={selectedGroup} />
      ) : (
        <div className="sub-header"></div>
      )}

      <div className="flex-grow">
        {/* ✅ pass modal control to all child pages */}
        <Outlet context={{ setSelectedItem }} />
      </div>

      <Footer />

      {/* ✅ render modal if item selected */}
      {selectedItem && (
        <ImageModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
