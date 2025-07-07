import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

export default function ProtectiveLayout() {
  const outletContext = useOutletContext();

  return (
    <main className="main-page flex-1 bg-gray-100 flex items-center justify-center max-w-7xl mx-auto p-4">
      <Outlet context={outletContext} />
    </main>
  );
}
