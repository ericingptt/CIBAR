import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, usePlatformState, switchToLine } from '../../lib/scenario02Store';

// Section 十七/十八: withdrawal request followed by the scripted failure
// (a "resource security verification" demand) - failure auto-returns to
// LINE, no button lets the player skip straight past it.
export function WithdrawalPage() {
  useSaveScenario02Progress('/scenario02-romance/withdrawal');
  useStageClassName('bition-stage');
  const navigate = useNavigate();
  const [platform] = usePlatformState();
  const [phase, setPhase] = useState('form');
  const total = platform.balance || 38640;

  function requestWithdrawal() {
    setPhase('reviewing');
    setTimeout(() => setPhase('failed'), 1500);
  }

  useEffect(() => {
    if (phase !== 'failed') return undefined;
    const t = setTimeout(() => {
      switchToLine(navigate, { page: 'withdrawal-failed', withdrawalStep: 'failed' });
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  return (
    <div className="bition-app">
      <header className="bition-sub-header">
        <div className="bition-home-logo small">幣勝客 <span>BITION</span></div>
      </header>
      <div className="bition-home-scroll">
        <div className="bition-card">
          <h2 className="bition-section-title">申請提領</h2>
          <div className="bition-stat-row"><span>總資產估值</span><strong>{total.toFixed(2)} CIBDT</strong></div>
          <div className="bition-stat-row"><span>累積收益</span><strong>+{(platform.profit || 8640).toFixed(2)} CIBDT</strong></div>

          {phase === 'form' && (
            <>
              <div className="bition-stat-row"><span>可提領資產</span><strong>{total.toFixed(2)} CIBDT</strong></div>
              <div className="bition-stat-row"><span>預計到帳</span><strong>NT${Math.round(total).toLocaleString()}</strong></div>
              <button type="button" className="bition-btn-primary" onClick={requestWithdrawal}>確認提領</button>
            </>
          )}

          {phase === 'reviewing' && <p className="bition-processing">提領申請審核中……</p>}

          {phase === 'failed' && (
            <div className="bition-withdraw-failed">
              <h3>提領暫時無法完成</h3>
              <p>您的帳戶尚未完成資金安全驗證。完成驗證後，即可恢復完整提領權限。</p>
              <div className="bition-stat-row"><span>資金安全驗證金</span><strong>NT$30,000</strong></div>
              <button type="button" className="bition-btn-primary" disabled>完成安全驗證</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
