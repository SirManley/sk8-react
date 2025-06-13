// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ItemsList    from './pages/ItemsList';
import EditItem     from './pages/EditItem';

import SkateboardsLayout from './pages/skateboards/SkateboardsLayout';
import SkateboardsHome from './pages/skateboards/SkateboardsHome';
import SkateboardsCategory from './pages/skateboards/SkateboardsCategory';

import WheelsLayout from './pages/wheels/WheelsLayout';
import WheelsCategory from './pages/wheels/WheelsCategory';
import WheelsHome from './pages/wheels/WheelsHome';

import TrucksLayout from './pages/trucks/TrucksLayout'
import TrucksHome   from './pages/trucks/TrucksHome'
import TrucksCategory from './pages/trucks/TrucksCategory'

function App() {
  return (
<BrowserRouter>
  <Routes>
    {/* Parent for MainLayout and all its children */}
    <Route element={<MainLayout />}>
      {/* Home */}
      <Route path="/" element={<Home />} />
      {/* Admin */}
      <Route path="admin" element={<Admin />} />
      {/* …other top-level routes… */}

      {/* Items List & Edit */}
      <Route path="items" element={<ItemsList />} />
      <Route path="items/:id/edit" element={<EditItem />} />

      {/* Skateboards (nested) */}
      <Route path="skateboards" element={<SkateboardsLayout />}>
        <Route index element={<SkateboardsHome />} />
        <Route path=":category" element={<SkateboardsCategory />} />
      </Route>

      {/* Wheels (nested) */}
      <Route path="wheels" element={<WheelsLayout />}>
        <Route index element={<WheelsHome />} />
        <Route path=":category" element={<WheelsCategory />} />
      </Route>

      {/* Trucks (nested) */}
      <Route path="trucks" element={<TrucksLayout />}>
        <Route index element={<TrucksHome />} />
        <Route path=":category" element={<TrucksCategory />} />
      </Route>
    {/* ← Close the MainLayout parent here */}
    </Route>

  </Routes>
</BrowserRouter>

  );
}

export default App;
