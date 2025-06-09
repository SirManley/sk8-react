// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout         from './layouts/MainLayout';
import Home               from './pages/Home';
import Admin              from './pages/Admin';
import ItemsList          from './pages/ItemsList';
import EditItem           from './pages/EditItem';

import SkateboardsLayout  from './pages/skateboards/SkateboardsLayout';
import SkateboardsHome    from './pages/skateboards/SkateboardsHome';
import SkateboardsCategory from './pages/skateboards/SkateboardsCategory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Admin (upload) */}
          <Route path="admin" element={<Admin />} />

          {/* “View All” page */}
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id/edit" element={<EditItem />} />

          {/* Skateboards section (nested) */}
          <Route path="skateboards" element={<SkateboardsLayout />}>
            {/* Index: /skateboards → SkateboardsHome.jsx */}
            <Route index element={<SkateboardsHome />} />

            {/* /skateboards/:category → SkateboardsCategory.jsx */}
            <Route path=":category" element={<SkateboardsCategory />} />
          </Route>

          {/* …any other sections… */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
