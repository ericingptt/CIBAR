import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';

const SWIPE_THRESHOLD = 110;
const MAX_ROTATE_DEG = 9;
const EXIT_DISTANCE = 560;
const EXIT_MS = 380;

// Full-bleed swipeable profile card: drag via pointer events (mouse + touch,
// no separate handlers needed), or an imperative swipeLike()/swipePass()
// for the bottom action buttons - both funnel through the same exit
// animation so a button tap and a real drag look identical.
export const ProfileCard = forwardRef(function ProfileCard({ person, onSwiped }, ref) {
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [exiting, setExiting] = useState(null); // 'like' | 'pass' | null
  const [photoFailed, setPhotoFailed] = useState(false);
  const startXRef = useRef(0);
  const pointerIdRef = useRef(null);

  function finishSwipe(direction) {
    if (exiting) return;
    setExiting(direction);
    setDrag({ x: direction === 'like' ? EXIT_DISTANCE : -EXIT_DISTANCE, active: false });
    setTimeout(() => onSwiped?.(direction), EXIT_MS);
  }

  useImperativeHandle(ref, () => ({
    swipeLike: () => finishSwipe('like'),
    swipePass: () => finishSwipe('pass'),
  }));

  function onPointerDown(e) {
    if (exiting) return;
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    setDrag({ x: 0, active: true });
  }

  function onPointerMove(e) {
    if (!drag.active || pointerIdRef.current !== e.pointerId) return;
    setDrag({ x: e.clientX - startXRef.current, active: true });
  }

  function onPointerUp(e) {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    if (drag.x > SWIPE_THRESHOLD) {
      finishSwipe('like');
    } else if (drag.x < -SWIPE_THRESHOLD) {
      finishSwipe('pass');
    } else {
      setDrag({ x: 0, active: false });
    }
  }

  const rotate = Math.max(-MAX_ROTATE_DEG, Math.min(MAX_ROTATE_DEG, drag.x / 14));
  const stampOpacity = Math.min(1, Math.abs(drag.x) / SWIPE_THRESHOLD);
  const showLikeStamp = exiting === 'like' || drag.x > 12;
  const showPassStamp = exiting === 'pass' || drag.x < -12;

  return (
    <article
      className="tanu-profile-card"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: `translateX(${drag.x}px) rotate(${exiting ? (exiting === 'like' ? MAX_ROTATE_DEG : -MAX_ROTATE_DEG) : rotate}deg)`,
        transition: drag.active ? 'none' : `transform ${exiting ? EXIT_MS : 400}ms cubic-bezier(.34,1.56,.64,1)`,
        opacity: exiting ? 0 : 1,
      }}
    >
      {person.photo && !photoFailed ? (
        <img
          className="tanu-profile-photo"
          src={person.photo}
          alt={person.name}
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div className="tanu-profile-photo tanu-profile-photo-fallback">
          <UserRound size={96} strokeWidth={1.2} />
        </div>
      )}
      <div className="tanu-profile-shade" />

      {showLikeStamp && (
        <div className="tanu-stamp like" style={{ opacity: exiting === 'like' ? 1 : stampOpacity }}>喜歡</div>
      )}
      {showPassStamp && (
        <div className="tanu-stamp pass" style={{ opacity: exiting === 'pass' ? 1 : stampOpacity }}>略過</div>
      )}

      <div className="tanu-profile-info">
        <div className="tanu-profile-name-row">
          <span className="tanu-profile-name">{person.name}</span>
          <span className="tanu-profile-age">{person.age}</span>
        </div>
        <div className="tanu-profile-distance">
          <span className="tanu-online-dot" />
          {person.distance}
        </div>
        <div className="tanu-profile-job">{person.job}</div>
        <p className="tanu-profile-bio">{person.bio}</p>
        <div className="tanu-profile-tags">
          {person.tags.map((tag) => (
            <span className="tanu-profile-tag" key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
});
