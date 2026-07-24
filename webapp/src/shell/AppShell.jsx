import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useFitStage } from './useFitStage';
import { StageClassProvider } from './StageClassContext';
import { installMediaAutoplayPrimer } from '../lib/mediaAutoplay';

// Mounted once at the app root (see src/main.jsx), stays mounted across every
// route change - replaces the old per-page fitStage()/topbar/script-tag
// boilerplate with one shared frame.
export function AppShell() {
  const stageRef = useRef(null);
  const [extraClass, setExtraClass] = useState('');
  useFitStage(stageRef);
  useEffect(() => installMediaAutoplayPrimer(), []);

  return (
    <div ref={stageRef} className={`app ar-stage${extraClass ? ' ' + extraClass : ''}`}>
      <StageClassProvider setExtraClass={setExtraClass}>
        <Outlet />
      </StageClassProvider>
    </div>
  );
}
