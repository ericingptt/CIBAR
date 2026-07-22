import { UserRound } from 'lucide-react';
import { TanuLogo } from './TanuLogo';

// Match celebration overlay - deliberately restrained: no "It's a Match!",
// no forced sound, no confetti. Blurred backdrop over whatever screen
// triggered it, staggered fade/scale-in, button appears last.
export function MatchOverlay({ person, isEmily, onStart }) {
  return (
    <div className="tanu-match-overlay">
      <div className="tanu-match-avatars">
        <span className="tanu-match-avatar you">
          <UserRound size={40} strokeWidth={1.4} />
        </span>
        <span className="tanu-match-avatar person">
          {person.photo ? (
            <img src={person.photo} alt={person.name} />
          ) : (
            <UserRound size={40} strokeWidth={1.4} />
          )}
        </span>
      </div>
      <div className="tanu-match-wordmark"><TanuLogo size={15} /></div>
      <div className="tanu-match-title">配對成功</div>
      <p className="tanu-match-sub">
        {isEmily ? 'Emily 傳來了第一則訊息' : '你們對彼此都有好感'}
      </p>
      <button type="button" className="tanu-match-btn" onClick={onStart}>開始聊天</button>
    </div>
  );
}
