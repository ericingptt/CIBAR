import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, switchToLine } from '../../lib/scenario02Store';
import { useCountUp } from '../../lib/useCountUp';

// Section 十二/十三: purely simulated deposit - no real bank account, wallet
// address, QR code, or transfer instructions anywhere on this page.
export function DepositPage() {
  useSaveScenario02Progress('/scenario02-romance/deposit');
  useStageClassName('bition-stage');
  const navigate = useNavigate();
  const [status, setStatus] = useState('form');
  const [animatedTarget, setAnimatedTarget] = useState(0);
  const balance = useCountUp(animatedTarget, 1400);

  function confirmDeposit() {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setAnimatedTarget(10000);
    }, 1200);
  }

  useEffect(() => {
    if (status !== 'success') return undefined;
    const t = setTimeout(() => {
      switchToLine(navigate, {
        depositCompleted: true,
        selectedStrategy: 'ai-arbitrage',
        balance: 10000,
        profit: 0,
        platformStep: 'running',
        page: 'deposit-success',
      });
    }, 2400);
    return () => clearTimeout(t);
  }, [status, navigate]);

  return (
    <div className="bition-app">
      <header className="bition-sub-header">
        <div className="bition-home-logo small">幣勝客 <span>BITION</span></div>
      </header>
      <div className="bition-home-scroll">
        <div className="bition-card">
          <h2 className="bition-section-title">啟用 AI 智能套利策略</h2>

          {status === 'form' && (
            <>
              <div className="bition-stat-row"><span>入金金額</span><strong>10,000 CIBDT</strong></div>
              <div className="bition-stat-row"><span>換算</span><strong>約 NT$10,000</strong></div>
              <button type="button" className="bition-btn-primary" onClick={confirmDeposit}>模擬完成入金</button>
              <p className="mini bition-sim-note">此為情境模擬，不會產生真實交易，亦無任何真實付款功能。</p>
            </>
          )}

          {status === 'processing' && <p className="bition-processing">入金處理中……</p>}

          {status === 'success' && (
            <div className="bition-deposit-success">
              <p className="bition-success-line">入金成功</p>
              <div className="bition-asset-value large">{balance.toFixed(2)} <span>CIBDT</span> 已到帳</div>
              <div className="bition-status-pill running">運行中</div>
              <div className="bition-fake-chart">
                <svg viewBox="0 0 200 60" className="candlestick-chart">
                  <defs>
                    <linearGradient id="depositChartGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#25d0ff" />
                      <stop offset="100%" stopColor="#39d98a" />
                    </linearGradient>
                  </defs>
                  <path
                    className="trend-line"
                    style={{ stroke: 'url(#depositChartGlow)' }}
                    d="M4,48 L30,40 L58,44 L86,28 L114,32 L142,16 L170,20 L196,6"
                  />
                </svg>
              </div>
              <p className="mini">首次結算倒數：23:59:42</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
