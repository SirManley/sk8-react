// src/layouts/MainLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import SubHeaderNav from '../components/SubHeaderNav';
import Footer from '../components/Footer';

export default function MainLayout() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const location = useLocation();

  // Show sub-header only for certain parent routes (like /skateboards)
  const showSubHeader =
    location.pathname.startsWith('/skateboards') ||
    location.pathname.startsWith('/wheels')    ||
    location.pathname.startsWith('/trucks');

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav setSelectedGroup={setSelectedGroup} />

      {showSubHeader ? (
        <SubHeaderNav selectedGroup={selectedGroup} />
      ) : (
        <div className="sub-header"></div> // still show the empty grey bar
      )}

      <div className="flex-grow">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
