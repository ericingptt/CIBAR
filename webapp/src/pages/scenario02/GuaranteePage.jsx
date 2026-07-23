import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, usePlatformState } from '../../lib/scenario02Store';

// Section 二十四: the "verification top-up" page reached after the second
// red warning. No real bank/wallet/QR/payment instructions - clicking
// through always ends in the scripted account-freeze message, never in an
// endless top-up loop, and leads straight into the educational disclosure.
export function GuaranteePage() {
  useSaveScenario02Progress('/scenario02-romance/guarantee');
  useStageClassName('bition-stage');
  const navigate = useNavigate();
  const [platform] = usePlatformState();
  const [status, setStatus] = useState('form');
  const projected = (platform.balance || 38640) + 30000;

  function confirmVerification() {
    setStatus('processing');
    setTimeout(() => setStatus('frozen'), 1500);
  }

  return (
    <div className="bition-app">
      <header className="bition-sub-header">
        <div className="bition-home-logo small">幣勝客 <span>BITION</span></div>
      </header>
      <div className="bition-home-scroll">
        <div className="bition-card">
          <h2 className="bition-section-title">完成資金安全驗證</h2>

          {status === 'form' && (
            <>
              <div className="bition-stat-row"><span>驗證金額</span><strong>NT$30,000</strong></div>
              <div className="bition-stat-row"><span>完成後預計可提領</span><strong>NT${Math.round(projected).toLocaleString()}</strong></div>
              <button type="button" className="bition-btn-primary" onClick={confirmVerification}>模擬完成驗證</button>
              <p className="mini bition-sim-note">此為情境模擬，不會產生真實交易，亦無任何真實付款功能。</p>
            </>
          )}

          {status === 'processing' && <p className="bition-processing">驗證處理中……</p>}

          {status === 'frozen' && (
            <div className="bition-withdraw-failed">
              <h3>帳戶暫時凍結</h3>
              <p>系統偵測您的帳戶涉及異常交易。請聯繫線上客服完成解凍程序。</p>
              <button type="button" className="bition-btn-primary" onClick={() => navigate('/scenario02-romance/risk-analysis')}>
                查看發生了什麼事
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
