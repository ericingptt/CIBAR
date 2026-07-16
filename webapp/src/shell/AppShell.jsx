import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useFitStage } from './useFitStage';
import { StageClassProvider } from './StageClassContext';
import { DebugPanel } from '../gesture/DebugPanel';

// Mounted once at the app root (see src/main.jsx), stays mounted across every
// route change — this is what lets the persistent gesture camera/model survive
// navigation instead of restarting per page, and what replaces the old
// per-page fitStage()/topbar/script-tag boilerplate with one shared frame.
export function AppShell() {
  const stageRef = useRef(null);
  const [extraClass, setExtraClass] = useState('');
  useFitStage(stageRef);

  return (
    <>
      <div ref={stageRef} className={`app ar-stage${extraClass ? ' ' + extraClass : ''}`}>
        <StageClassProvider setExtraClass={setExtraClass}>
          <Outlet />
        </StageClassProvider>
      </div>
      {/* Rendered outside the stage div on purpose: the stage has a CSS
          transform (from useFitStage) which would otherwise become the
          containing block for this panel's position:fixed, scaling/moving
          it along with the stage instead of staying pinned to the real
          viewport corner. */}
      <DebugPanel />
    </>
  );
}
