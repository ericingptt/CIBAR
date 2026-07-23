import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const TABS = ['首頁', '市場', '策略', '資產', '我的'];

const MARKET = [
  ['SOL', '$142.80', '+6.4%'],
  ['BTC', '$61,230', '+1.2%'],
  ['ETH', '$3,410', '+0.8%'],
  ['USDT', '$1.00', '0.0%'],
];

export function PlatformHome() {
  useSaveScenario02Progress('/scenario02-romance/platform-home');
  const navigate = useNavigate();
  const [tab, setTab] = useState('首頁');

  return (
    <>
      <TopBar brand="NOVA QUANT" />
      <Platform>
        {tab === '首頁' && (
          <>
            <h2>資產總覽</h2>
            <Stat label="總資產估值" value="0.00 USDT" />
            <Stat label="今日收益" value="0.00 USDT" />
            <div className="fake-chart" style={{ marginTop: 16 }}>
              <div className="chart-top"><span>SOL AI 趨勢策略</span><strong>等待啟用</strong></div>
              <div className="stat"><span>預估日收益</span><span>2.8% ～ 6.5%</span></div>
              <div className="stat"><span>風險等級（平台自稱）</span><span>低</span></div>
            </div>
            <Button onClick={() => navigate('/scenario02-romance/deposit')}>立即入金</Button>
          </>
        )}
        {tab === '市場' && (
          <>
            <h2>市場</h2>
            {MARKET.map(([sym, price, change]) => (
              <Stat key={sym} label={sym} value={`${price} (${change})`} />
            ))}
          </>
        )}
        {tab === '策略' && (
          <>
            <h2>SOL AI 趨勢策略</h2>
            <p>透過 AI 模型分析 SOL 短線走勢，自動判斷進出場時機。</p>
            <Stat label="預估日收益" value="2.8% ～ 6.5%" />
            <Stat label="風險等級（平台自稱）" value="低" />
            <Stat label="狀態" value="等待啟用" />
          </>
        )}
        {tab === '資產' && (
          <>
            <h2>資產</h2>
            <Stat label="USDT 餘額" value="0.00 USDT" />
          </>
        )}
        {tab === '我的' && (
          <>
            <h2>我的</h2>
            <Stat label="帳號" value="guest_0218" />
            <Stat label="推薦人" value="EMILY88" />
            <Stat label="客服" value="線上客服（點擊聯絡）" />
            <Stat label="服務條款" value="查看條款" />
          </>
        )}

        <div className="platform-nav">
          {TABS.map((t) => (
            <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </Platform>

      <button
        type="button"
        className="btn secondary platform-drawer-toggle"
        onClick={() => navigate('/scenario02-romance/private-chat')}
      >
        返回 LINE
      </button>
    </>
  );
}
