import { useEffect, useRef, useState } from 'react';

// Port of the old js/app.js runVideo(): a 300ms-tick countdown/progress bar
// that pauses at t===12 to show a fraud-warning modal, and stops entirely at
// t>=50.
export function useVideoProgress() {
  const [seconds, setSeconds] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setSeconds((t) => {
        const next = t + 1;
        if (next === 12) {
          pausedRef.current = true;
          setShowWarning(true);
        }
        if (next >= 50) clearInterval(timer);
        return next;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  function continueVideo() {
    setShowWarning(false);
    pausedRef.current = false;
  }

  return { seconds, barWidth: Math.min(seconds * 2, 100), showWarning, continueVideo };
}
