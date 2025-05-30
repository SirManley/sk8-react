// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="max-w-7xl mx-auto py-4 px-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} SK8-or-Die Workshop. All rights reserved.
      </div>
    </footer>
  );
}
