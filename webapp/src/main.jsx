import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/global.css';
import { App } from './App.jsx';
import { GestureProvider } from './gesture/GestureProvider';

// HashRouter (not BrowserRouter): this is a kiosk-style app with no
// SEO/shareable-URL need, and it sidesteps GitHub Pages' "deep-link refresh
// returns 404" problem with zero extra tooling.
//
// GestureProvider wraps the router (not the other way around) so the camera
// + hand-tracking model survive every route change - React Router only ever
// unmounts the matched route's own subtree, never its ancestors.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GestureProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </GestureProvider>
  </StrictMode>,
);
