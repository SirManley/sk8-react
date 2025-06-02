// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import Footer    from '../components/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />

      <div className="flex-grow">
        <Outlet />   {/* <-- where nested routes (Home/Admin/SkateboardsLayout) render */}
      </div>

      <Footer />
    </div>
  );
}
