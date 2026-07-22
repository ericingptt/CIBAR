import { MessageCircle, UserRound } from 'lucide-react';
import { TanuLogo } from './TanuLogo';

export function TanuHeader({ onProfileClick }) {
  return (
    <header className="tanu-header">
      <TanuLogo size={22} />
      <div className="tanu-header-icons">
        <button type="button" className="tanu-icon-btn" aria-label="訊息">
          <MessageCircle size={23} />
        </button>
        <button type="button" className="tanu-icon-btn" aria-label="個人檔案" onClick={onProfileClick}>
          <UserRound size={23} />
        </button>
      </div>
    </header>
  );
}
