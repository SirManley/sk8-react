// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';

export default function Mainlayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />

      {/* All pages (Home, Admin, Skateboards/*, Wheels/*, etc.) render here */}
      <div className="flex-grow">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
