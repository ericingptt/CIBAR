import { Navigate } from 'react-router-dom';
import { hasLanguage } from './lang';

// Port of scanner.html's inline guard: if(!hasLanguage()){location.replace('index.html')}
export function RequireLanguage({ children }) {
  if (!hasLanguage()) return <Navigate to="/" replace />;
  return children;
}
