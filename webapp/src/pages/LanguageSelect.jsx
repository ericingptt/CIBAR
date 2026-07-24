import { useNavigate } from 'react-router-dom';
import { setLanguage, getLanguage } from '../lib/lang';

const LANGUAGES = [
  { code: 'zh', label: '🇹🇼 中文' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'jp', label: '🇯🇵 日本語' },
];

export function LanguageSelect() {
  const navigate = useNavigate();
  const currentLang = getLanguage();

  function confirm(code) {
    setLanguage(code);
    navigate('/scenario-menu');
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">CIB AR ANTI-FRAUD</div>
      </div>
      <section className="hero">
        <p className="mini">刑事警察局 AR 反詐騙教育館</p>
        <h1>AI 防詐調查任務</h1>
        <p>你將化身反詐小刑警，體驗各種常見詐騙手法的完整情境。</p>
        <h2>請選擇語言</h2>
        <div className="lang-grid" aria-label="語言選擇">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`choice${l.code === currentLang ? ' active' : ''}`}
              onClick={() => confirm(l.code)}
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
