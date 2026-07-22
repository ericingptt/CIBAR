import { Layers, MessageCircle, UserRound } from 'lucide-react';

// lucide-react has no icon literally named "Cards" - Layers (a card-stack
// glyph) is the closest real icon for the explore/swipe tab.
const TABS = [
  { key: 'cards', Icon: Layers, label: '探索' },
  { key: 'messages', Icon: MessageCircle, label: '訊息' },
  { key: 'profile', Icon: UserRound, label: '個人檔案' },
];

export function TanuBottomNav({ active = 'cards', onSelect }) {
  return (
    <nav className="tanu-bottom-nav">
      {TABS.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          className="tanu-bottom-nav-btn"
          aria-label={label}
          aria-current={active === key ? 'page' : undefined}
          onClick={() => onSelect?.(key)}
          style={{ color: active === key ? '#FF4668' : '#A6A6AF' }}
        >
          <Icon size={24} strokeWidth={active === key ? 2.4 : 2} />
        </button>
      ))}
    </nav>
  );
}
