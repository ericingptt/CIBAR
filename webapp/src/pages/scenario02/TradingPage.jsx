import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const ACTIVATION_STEPS = ['掃描市場趨勢', '分析成交量', '偵測買入訊號', '建立 SOL 部位'];
const ASSET_STEPS = [315.0, 328.6, 351.2, 389.8, 426.45];
const TRADES = [
  { side: 'BUY', pct: '+4.32%' },
  { side: 'SELL', pct: '+6.88%' },
  { side: 'BUY', pct: '+9.41%' },
];

export function TradingPage() {
  useSaveScenario02Progress('/scenario02-romance/trading');
  const navigate = useNavigate();
  const [activationIndex, setActivationIndex] = useState(-1);
  const [phase, setPhase] = useState('activating');
  const [assetIndex, setAssetIndex] = useState(0);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellSeen, setUpsellSeen] = useState(false);

  useEffect(() => {
    if (phase !== 'activating') return undefined;
    if (activationIndex >= ACTIVATION_STEPS.length - 1) {
      const t = setTimeout(() => setPhase('running'), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActivationIndex((i) => i + 1), 650);
    return () => clearTimeout(t);
  }, [phase, activationIndex]);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    if (assetIndex >= ASSET_STEPS.length - 1) {
      const t = setTimeout(() => setShowUpsell(true), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setAssetIndex((i) => i + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, assetIndex]);

  const finished = phase === 'running' && assetIndex >= ASSET_STEPS.length - 1;
  const tradesShown = Math.min(assetIndex, TRADES.length);

  function dismissUpsell() {
    setShowUpsell(false);
    setUpsellSeen(true);
  }

  return (
    <>
      <TopBar brand="NOVA QUANT" />
      <Platform>
        {phase === 'activating' && (
          <>
            <h2>正在分析市場……</h2>
            <ul className="step-status-list">
              {ACTIVATION_STEPS.map((step, i) => (
                <li key={step} className={i <= activationIndex ? 'done' : ''}>
                  <span className="dot" /> {step}
                </li>
              ))}
            </ul>
          </>
        )}

        {phase === 'running' && (
          <>
            <h2>{finished ? '策略執行中' : '正在建立部位……'}</h2>
            <div className="asset-row">
              <div>
                <span className="mini">總資產</span>
                <div className="big-money">{ASSET_STEPS[assetIndex].toFixed(2)} USDT</div>
              </div>
              {finished && <div className="profit-badge">+111.45 USDT</div>}
            </div>
            {tradesShown > 0 && (
              <div className="platform" style={{ marginTop: 12 }}>
                {TRADES.slice(0, tradesShown).map((t, i) => (
                  <Stat key={i} label={`SOL / USDT　${t.side}`} value={`收益：${t.pct}`} />
                ))}
              </div>
            )}
            {finished && (
              <>
                <Stat label="今日收益" value="+111.45 USDT（約 NT$3,538）" />
                <div className="tip-inline" style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)', border: '1px solid var(--line)' }}>
                  Emily：有看到嗎？今天的訊號滿準的😊
                </div>
                {upsellSeen && (
                  <Button onClick={() => navigate('/scenario02-romance/withdrawal')}>申請出金</Button>
                )}
              </>
            )}
          </>
        )}
      </Platform>

      <Modal show={showUpsell}>
        <div className="card">
          <h2>限時策略升級</h2>
          <p>再入金 20,000 元，即可解鎖進階策略。預估收益提升至 12.8%。</p>
          <div className="tip-inline" style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)', border: '1px solid var(--line)', marginBottom: 12 }}>
            Emily：你不要一次放太多啦。先確認自己可以接受比較重要。
          </div>
          <p className="mini">系統建議：先完成首次提領驗證。</p>
          <div className="btns">
            <button className="btn secondary" type="button" onClick={dismissUpsell}>先提領看看</button>
            <button className="btn secondary" type="button" onClick={dismissUpsell}>暫時不要</button>
            <button className="btn" type="button" onClick={dismissUpsell}>立即加碼</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
