// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ItemsList from './pages/ItemsList';
import EditItem from './pages/EditItem';

import SkateboardsLayout from './pages/skateboards/SkateboardsLayout';
import SkateboardsHome from './pages/skateboards/SkateboardsHome';
import SkateboardsCategory from './pages/skateboards/SkateboardsCategory';

// At the top (import the components you’ll create shortly)
import WheelsLayout from './pages/wheels/WheelsLayout';
import WheelsCategory from './pages/wheels/WheelsCategory';
import WheelsHome from './pages/wheels/WheelsHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Admin (upload) */}
          <Route path="admin" element={<Admin />} />

          {/* Items List and Edit pages */}
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id/edit" element={<EditItem />} />

          {/* Skateboards (nested routes) */}
          <Route path="skateboards" element={<SkateboardsLayout />}>
            <Route index element={<SkateboardsHome />} />
            <Route path=":category" element={<SkateboardsCategory />} />
          </Route>

          {/* Wheels (nested routes) */}
          <Route path="wheels" element={<WheelsLayout />}>
          <Route path="/wheels" element={<WheelsHome />} />
           <Route path=":category" element={<WheelsCategory />} />
          </Route>

          
          {/* Additional sections will go here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
