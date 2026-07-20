import { Navigate } from 'react-router-dom';
import { hasLanguage } from './lang';

// Port of scanner.html's inline guard: if(!hasLanguage()){location.replace('index.html')}
// Redirects to /language, not / (the gesture tutorial) - picking a language
// is the actual prerequisite for /scanner, and re-running the one-time
// gesture tutorial isn't warranted just because someone landed here directly
// without a language chosen yet.
export function RequireLanguage({ children }) {
  if (!hasLanguage()) return <Navigate to="/language" replace />;
  return children;
}
