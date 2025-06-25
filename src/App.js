// src/App.js
import React from 'react';
//import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';



import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ItemsList from './pages/ItemsList';
import EditItem from './pages/EditItem';

import SkateboardsLayout from './pages/skateboards/SkateboardsLayout';
import SkateboardsHome from './pages/skateboards/SkateboardsHome';
import SkateboardsCategory from './pages/skateboards/SkateboardsCategory';

import WheelsLayout from './pages/wheels/WheelsLayout';
import WheelsCategory from './pages/wheels/WheelsCategory';
import WheelsHome from './pages/wheels/WheelsHome';

import TrucksLayout from './pages/trucks/TrucksLayout';
import TrucksHome from './pages/trucks/TrucksHome';
import TrucksCategory from './pages/trucks/TrucksCategory';

import AccessoriesLayout from './pages/accessories/AccessoriesLayout';
import AccessoriesHome from './pages/accessories/AccessoriesHome';
import AccessoriesCategory from './pages/accessories/AccessoriesCategory';

import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔐 Login page - outside of MainLayout */}
        <Route path="/login" element={<Login />} />

        {/* 🌐 All other routes use MainLayout */}
        <Route element={<MainLayout />}>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Admin - protected by RequireAuth */}
          <Route path="admin" element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          } />

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

          {/* Accessories (nested) */}
          <Route path="accessories" element={<AccessoriesLayout />}>
            <Route index element={<AccessoriesHome />} />
            <Route path=":category" element={<AccessoriesCategory />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
