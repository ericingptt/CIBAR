import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, usePlatformState, switchToLine } from '../../lib/scenario02Store';
import { useCountUp } from '../../lib/useCountUp';

const TABS = ['首頁', '市場', '策略', '資產', '我的'];

const POOLS = [
  { name: '全球趨勢池', change: '+3.82%', nodes: 24 },
  { name: '跨市場套利池', change: '+2.46%', nodes: 18 },
  { name: '智能網格池', change: '+4.15%', nodes: 32 },
];

// Fictional, constantly-scrolling "recent executions" feed - purely a
// visual simulation (no real trade data, no real coin names) that makes the
// home screen read as "actively running" rather than a static page.
const TICKER_ROWS = [
  '20:31:12　跨市場價差捕捉　+12.6 CIBDT',
  '20:31:08　智能網格結算　　+8.2 CIBDT',
  '20:30:54　全球趨勢套利　　+16.4 CIBDT',
  '20:30:41　跨市場價差捕捉　+9.8 CIBDT',
  '20:30:22　智能網格結算　　+11.3 CIBDT',
];

// Every step after 'idle' has already been through the first deposit; the
// two "stageN" steps are the moments Emily proactively messages about
// profit having grown, per the story script - the player never has to
// click anything to see the number move, matching the scripted beats in
// PrivateChat's NODES (s14-end/s16-end).
const AUTO_ADVANCE_STEPS = new Set(['stage1', 'stage3']);

export function PlatformHome() {
  useSaveScenario02Progress('/scenario02-romance/platform-home');
  useStageClassName('bition-stage');
  const navigate = useNavigate();
  const [platform] = usePlatformState();
  const [tab, setTab] = useState('首頁');
  const firedRef = useRef(null);

  const balance = useCountUp(platform.balance);
  const profit = useCountUp(platform.profit);
  const running = platform.depositCompleted;

  // Emily "checking in" on profit: the platform doesn't wait for a click at
  // these two beats, it just returns to LINE on its own after the player has
  // had a moment to see the new number - see section 十五/十六 of the story.
  useEffect(() => {
    if (!AUTO_ADVANCE_STEPS.has(platform.platformStep)) return undefined;
    if (firedRef.current === platform.platformStep) return undefined;
    firedRef.current = platform.platformStep;
    const t = setTimeout(() => switchToLine(navigate, { page: 'home' }), 2600);
    return () => clearTimeout(t);
  }, [platform.platformStep, navigate]);

  function viewStrategy() {
    switchToLine(navigate, {
      page: 'home',
      registrationCompleted: true,
      accountCreated: true,
      termsAccepted: true,
    });
  }

  return (
    <div className="bition-app">
      <header className="bition-home-header">
        <div className="bition-home-logo">
          幣勝客
          <span>BITION</span>
        </div>
        <div className="bition-home-icons">
          <button type="button" aria-label="通知"><Bell size={18} /></button>
          <button type="button" aria-label="帳戶"><User size={18} /></button>
        </div>
      </header>

      <div className="bition-home-scroll">
        {tab === '首頁' && (
          <>
            <div className="bition-card bition-asset-card">
              <div className="bition-asset-label">我的資產</div>
              <div className="bition-asset-value">{balance.toFixed(2)} <span>CIBDT</span></div>
              <div className="bition-asset-sub">≈ NT${Math.round(balance).toLocaleString()}</div>
              <div className="bition-asset-profit">
                <span>今日收益</span>
                <strong className={profit > 0 ? 'up bition-pulse' : ''}>{profit.toFixed(2)} CIBDT</strong>
              </div>
              <svg viewBox="0 0 200 40" className="bition-asset-trend" aria-hidden="true">
                <defs>
                  <linearGradient id="homeChartGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#25d0ff" />
                    <stop offset="100%" stopColor="#39d98a" />
                  </linearGradient>
                </defs>
                <path
                  className="trend-line bition-trend-line"
                  style={{ stroke: 'url(#homeChartGlow)' }}
                  d="M4,32 L30,26 L58,29 L86,18 L114,22 L142,10 L170,14 L196,4"
                />
              </svg>
              <div className="bition-quick-actions">
                {['入金', '提領', '轉換', '紀錄'].map((label) => (
                  <div key={label} className="bition-quick-action" aria-disabled="true">
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bition-card bition-strategy-card">
              <div className="bition-strategy-head">
                <div>
                  <div className="bition-strategy-name">AI 智能套利策略</div>
                  <div className="bition-strategy-desc">全球多市場價格差自動追蹤</div>
                </div>
                <span className={`bition-status-pill ${running ? 'running' : ''}`}>
                  {running ? '運行中' : '等待啟用'}
                </span>
              </div>
              <div className="bition-strategy-grid">
                <div><span>預估日收益</span><strong>2.8%–6.5%</strong></div>
                <div><span>策略類型</span><strong>穩健型</strong></div>
                <div><span>結算資產</span><strong>CIBDT</strong></div>
              </div>
              {!running && (
                <button type="button" className="bition-btn-primary" onClick={viewStrategy}>
                  查看策略
                </button>
              )}
            </div>

            <div className="bition-pools">
              {POOLS.map((p) => (
                <div key={p.name} className="bition-card bition-pool-card">
                  <div className="bition-pool-name"><span className="bition-node-dot" />{p.name}</div>
                  <div className="bition-pool-row"><span>今日收益</span><strong className="up">{p.change}</strong></div>
                  <div className="bition-pool-row"><span>運行節點</span><strong>{p.nodes}</strong></div>
                </div>
              ))}
            </div>

            <div className="bition-card bition-ticker-card">
              <div className="bition-section-title small">即時策略執行紀錄</div>
              <div className="bition-ticker">
                <div className="bition-ticker-track">
                  {[...TICKER_ROWS, ...TICKER_ROWS].map((row, i) => (
                    <div className="bition-ticker-row" key={i}>{row}</div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === '市場' && (
          <div className="bition-card">
            <h2 className="bition-section-title">全球多市場套利</h2>
            <p className="mini">系統即時追蹤多個市場間的價格差，模擬呈現，不對應真實交易所報價。</p>
            {POOLS.map((p) => (
              <div key={p.name} className="bition-stat-row">
                <span>{p.name}</span>
                <strong className="up">{p.change}</strong>
              </div>
            ))}
          </div>
        )}

        {tab === '策略' && (
          <div className="bition-card">
            <h2 className="bition-section-title">AI 智能套利策略</h2>
            <div className="bition-stat-row"><span>策略市場</span><strong>全球多市場套利</strong></div>
            <div className="bition-stat-row"><span>預估日收益</span><strong>2.8%–6.5%</strong></div>
            <div className="bition-stat-row"><span>結算資產</span><strong>CIBDT</strong></div>
            <div className="bition-stat-row"><span>目前狀態</span><strong>{running ? '運行中' : '等待啟用'}</strong></div>
          </div>
        )}

        {tab === '資產' && (
          <div className="bition-card">
            <h2 className="bition-section-title">資產總覽</h2>
            <div className="bition-stat-row"><span>CIBDT 餘額</span><strong>{balance.toFixed(2)} CIBDT</strong></div>
            <div className="bition-stat-row"><span>累積收益</span><strong>{profit.toFixed(2)} CIBDT</strong></div>
          </div>
        )}

        {tab === '我的' && (
          <div className="bition-card">
            <h2 className="bition-section-title">我的</h2>
            <div className="bition-stat-row"><span>推薦人</span><strong>EMILY88</strong></div>
            <div className="bition-stat-row"><span>服務條款</span><strong>使用者服務協議</strong></div>
          </div>
        )}
      </div>

      <nav className="bition-bottom-nav">
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
    </div>
  );
}
