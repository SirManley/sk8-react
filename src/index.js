import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ add this line here:
import "yet-another-react-lightbox/styles.css";

// (optional) if you later enable captions, thumbnails, or fullscreen:
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import "yet-another-react-lightbox/plugins/thumbnails.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
