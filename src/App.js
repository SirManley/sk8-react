// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout           from './layouts/MainLayout';
import Home                 from './pages/Home';
import Admin                from './pages/Admin';

// ← 1. Import the new ItemsList page
import ItemsList            from './pages/ItemsList';
import EditItem             from './pages/EditItem';
import SkateboardsLayout    from './pages/skateboards/SkateboardsLayout';
import FeaturedSkateboards  from './pages/skateboards/FeaturedSkateboards';
import SkateboardsCategory  from './pages/skateboards/SkateboardsCategory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Admin (upload) */}
          <Route path="admin" element={<Admin />} />

          {/* ← 2. New “View All” page */}
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id/edit" element={<EditItem />} />

          {/* Skateboards section (nested) */}
          <Route path="skateboards" element={<SkateboardsLayout />}>
            <Route index element={<FeaturedSkateboards />} />
            <Route path=":category" element={<SkateboardsCategory />} />
          </Route>

          {/* …other sections */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
