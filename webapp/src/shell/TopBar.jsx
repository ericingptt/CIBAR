import { Link } from 'react-router-dom';

// Shared .topbar/.brand/.home-link pattern used by most pages. Not every page
// has one (e.g. the LINE chat page uses its own .phone-frame header instead),
// so this is opt-in per page rather than baked into AppShell.
export function TopBar({ brand, homeHref = '/language', homeLabel = '首頁' }) {
  return (
    <div className="topbar">
      <div className="brand">{brand}</div>
      <Link className="home-link" to={homeHref}>{homeLabel}</Link>
    </div>
  );
}
