import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ItemsList from "./pages/ItemsList";
import EditItem from "./pages/EditItem";

import SkateboardsLayout from "./pages/skateboards/SkateboardsLayout";
import SkateboardsHome from "./pages/skateboards/SkateboardsHome";
import SkateboardsCategory from "./pages/skateboards/SkateboardsCategory";

import WheelsLayout from "./pages/wheels/WheelsLayout";
import WheelsCategory from "./pages/wheels/WheelsCategory";
import WheelsHome from "./pages/wheels/WheelsHome";

import TrucksLayout from "./pages/trucks/TrucksLayout";
import TrucksHome from "./pages/trucks/TrucksHome";
import TrucksCategory from "./pages/trucks/TrucksCategory";

import AccessoriesLayout from "./pages/accessories/AccessoriesLayout";
import AccessoriesHome from "./pages/accessories/AccessoriesHome";
import AccessoriesCategory from "./pages/accessories/AccessoriesCategory";

import ApparelLayout from "./pages/apparel/ApparelLayout";
import ApparelHome from "./pages/apparel/ApparelHome";
import ApparelCategory from "./pages/apparel/ApparelCategory";

import MemorabiliaLayout from "./pages/memorabilia/MemorabiliaLayout";
import MemorabiliaHome from "./pages/memorabilia/MemorabiliaHome";
import MemorabiliaCategory from "./pages/memorabilia/MemorabiliaCategory";

import ProtectiveLayout from "./pages/protective/ProtectiveLayout";
import ProtectiveHome from "./pages/protective/ProtectiveHome";
import ProtectiveCategory from "./pages/protective/ProtectiveCategory";

import Stories from "./pages/Stories/Stories";
import StoryDetail from "./pages/Stories/StoryDetail";
import StoriesLayout from "./pages/Stories/StoriesLayout";




import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";

import SearchResults from "./pages/SearchResults";

import AdminStories from "./pages/AdminStories";
import EditStory from "./pages/EditStory";

function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <Router>
      <Routes>
        {/* 🔐 Login page - outside of MainLayout */}
        <Route path="/login" element={<Login />} />

        {/* 🌐 All other routes use MainLayout */}
        <Route
          element={
            <MainLayout
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          }
        >
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Admin - protected */}
          <Route
            path="admin"
            element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />

          {/* Items List & Edit */}
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id/edit" element={<EditItem />} />

          {/* Skateboards */}
          <Route path="skateboards" element={<SkateboardsLayout />}>
            <Route index element={<SkateboardsHome />} />
            <Route path=":category" element={<SkateboardsCategory />} />
          </Route>

          {/* Wheels */}
          <Route path="wheels" element={<WheelsLayout />}>
            <Route index element={<WheelsHome />} />
            <Route path=":category" element={<WheelsCategory />} />
          </Route>

          {/* Trucks */}
          <Route path="trucks" element={<TrucksLayout />}>
            <Route index element={<TrucksHome />} />
            <Route path=":category" element={<TrucksCategory />} />
          </Route>

          {/* Accessories */}
          <Route path="accessories" element={<AccessoriesLayout />}>
            <Route index element={<AccessoriesHome />} />
            <Route path=":category" element={<AccessoriesCategory />} />
          </Route>

          {/* Apparel */}
          <Route path="apparel" element={<ApparelLayout />}>
            <Route index element={<ApparelHome />} />
            <Route path=":category" element={<ApparelCategory />} />
          </Route>

          {/* Memorabilia */}
          <Route path="memorabilia" element={<MemorabiliaLayout />}>
            <Route index element={<MemorabiliaHome />} />
            <Route path=":category" element={<MemorabiliaCategory />} />
          </Route>

          {/* Protective */}
          <Route path="protective" element={<ProtectiveLayout />}>
            <Route index element={<ProtectiveHome />} />
            <Route path=":category" element={<ProtectiveCategory />} />
          </Route>

          {/* ✅ Stories (now centered like Trucks via StoriesLayout) */}
          <Route path="stories" element={<StoriesLayout />}>
            <Route index element={<Stories />} />
            <Route path=":slug" element={<StoryDetail />} />
          </Route>

          {/* Admin Stories routes */}
          <Route path="admin/stories" element={<AdminStories />} />
          <Route path="admin/stories/:id" element={<EditStory />} />

          {/* Search */}
          <Route
            path="search"
            element={<SearchResults setSelectedItem={setSelectedItem} />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

