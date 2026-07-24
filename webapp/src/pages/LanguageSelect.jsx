import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setLanguage, getLanguage } from '../lib/lang';
import { useGesture } from '../gesture/GestureProvider';

const LANGUAGES = [
  { code: 'zh', label: '🇹🇼 中文' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'jp', label: '🇯🇵 日本語' },
];

// First real gesture consumer. The old markup was already a small native-
// <button> grid with a ready-made focus-ring style (.choice.active), so no
// structural HTML change was needed to add a focus-cursor + confirm model -
// see the plan for why this page in particular adapts cleanly.
export function LanguageSelect() {
  const navigate = useNavigate();
  const currentLang = getLanguage();
  const startIndex = Math.max(0, LANGUAGES.findIndex((l) => l.code === currentLang));
  const [focusedIndex, setFocusedIndex] = useState(startIndex);
  const buttonRefs = useRef([]);
  const { gesture, seq } = useGesture();

  function confirm(index) {
    setLanguage(LANGUAGES[index].code);
    navigate('/camera-source');
  }

  // Keep native DOM focus in lockstep with the gesture/keyboard-driven
  // focusedIndex, so a sighted keyboard user's browser focus ring never
  // visually diverges from the .active ring.
  useEffect(() => {
    buttonRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  useEffect(() => {
    if (gesture === 'scrollDown') {
      setFocusedIndex((i) => (i + 1) % LANGUAGES.length);
    } else if (gesture === 'scrollUp') {
      setFocusedIndex((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length);
    } else if (gesture === 'select') {
      confirm(focusedIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % LANGUAGES.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">CIB AR ANTI-FRAUD</div>
      </div>
      <section className="hero">
        <p className="mini">刑事警察局 AR 反詐騙教育館</p>
        <h1>AI 防詐調查任務</h1>
        <p>你將化身反詐小刑警，透過 AR 眼鏡尋找現場可疑線索。掃描桌上物件或背板圖案，進入對應詐騙情境。</p>
        <h2>請選擇語言</h2>
        <div className="lang-grid" aria-label="語言選擇" onKeyDown={onKeyDown}>
          {LANGUAGES.map((l, index) => (
            <button
              key={l.code}
              ref={(el) => (buttonRefs.current[index] = el)}
              className={`choice${index === focusedIndex ? ' active' : ''}`}
              onClick={() => confirm(index)}
            >
              {l.label}
              <span className="chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
