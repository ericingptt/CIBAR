import { useEffect } from 'react';
import { playSound } from './playSound';

// Overlay, not a page - rendered on top of whatever screen triggered the
// match (DatingBrowse after liking Emily's card) rather than a route
// navigation, per the "not 跳頁" design note. DatingMatch.jsx also renders
// this directly (immediately, no trigger needed) purely so the step still
// has a stable, directly-linkable URL for testing.
export function MatchOverlay({ onDone }) {
  useEffect(() => {
    playSound('match');
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="match-overlay">
      <div className="match-overlay-avatars">
        <div className="match-overlay-avatar you">你</div>
        <div className="match-overlay-avatar emily">E</div>
      </div>
      <div className="match-overlay-title">It&rsquo;s a Match!</div>
      <p className="match-overlay-sub">You and Emily liked each other.</p>
    </div>
  );
}
