import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

// The very first thing the player sees on opening the link card - a
// professional-looking brand splash, not a bare registration form, so the
// platform reads as "real digital-asset app" before it ever asks for
// anything. All figures below are fictional story-visual data, not live
// numbers from anywhere.
const STATS = [
  { label: '全球運行節點', value: '128' },
  { label: '今日策略執行', value: '24,856 次' },
  { label: '平台資產規模', value: '86,420,000 CIBDT' },
];

export function PlatformLanding() {
  useSaveScenario02Progress('/scenario02-romance/platform-landing');
  useStageClassName('bition-stage');
  const navigate = useNavigate();

  return (
    <div className="bition-app">
      <div className="bition-landing-scroll">
        <div className="bition-logo-block">
          <div className="bition-logo">
            幣勝客
            <span>BITION</span>
          </div>
          <p className="bition-tagline">AI 智能數位資產交易</p>
        </div>

        <div className="bition-landing-visual" aria-hidden="true">
          <div className="bition-landing-orbit" />
          <div className="bition-landing-particle p1" />
          <div className="bition-landing-particle p2" />
          <div className="bition-landing-particle p3" />
          <div className="bition-landing-particle p4" />
          <span className="bition-landing-symbol">CIBDT</span>
        </div>

        <h1 className="bition-landing-title">讓 AI 為你捕捉全球市場價差</h1>
        <p className="bition-landing-sub">
          24 小時智能策略運行
          <br />
          即時追蹤全球多市場套利機會
        </p>

        <div className="bition-landing-stats">
          {STATS.map((s) => (
            <div key={s.label} className="bition-card bition-landing-stat">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="bition-landing-cta">
        <button
          type="button"
          className="bition-btn-primary"
          onClick={() => navigate('/scenario02-romance/platform-register')}
        >
          開始使用
        </button>
      </div>
    </div>
  );
}
