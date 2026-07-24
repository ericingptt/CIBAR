import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/global.css';
import { App } from './App.jsx';

// HashRouter (not BrowserRouter): this is a kiosk-style app with no
// SEO/shareable-URL need, and it sidesteps GitHub Pages' "deep-link refresh
// returns 404" problem with zero extra tooling.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
