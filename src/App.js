import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout           from './layouts/MainLayout';
import Home                 from './pages/Home';
import Admin                from './pages/Admin';

import SkateboardsLayout    from './pages/skateboards/SkateboardsLayout';
import FeaturedSkateboards  from './pages/skateboards/FeaturedSkateboards';
import SkateboardsCategory  from './pages/skateboards/SkateboardsCategory';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="admin" element={<Admin />} />

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
