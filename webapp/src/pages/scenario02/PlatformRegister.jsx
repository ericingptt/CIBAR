import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, savePlatformState } from '../../lib/scenario02Store';

export function PlatformRegister() {
  useSaveScenario02Progress('/scenario02-romance/platform-register');
  useStageClassName('bition-stage');
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('form');

  function createAccount() {
    setStatus('creating');
    setTimeout(() => {
      setStatus('done');
      savePlatformState({
        registrationCompleted: true,
        termsAccepted: true,
        accountCreated: true,
        page: 'home',
      });
      setTimeout(() => navigate('/scenario02-romance/platform-home'), 800);
    }, 900);
  }

  const canSubmit = agreed && phone.trim().length > 0 && password.length > 0 && confirm.length > 0;

  return (
    <div className="bition-app">
      <div className="bition-register-scroll">
        <div className="bition-logo-block">
          <div className="bition-logo">
            幣勝客
            <span>BITION</span>
          </div>
          <p className="bition-tagline">AI 智能數位資產交易</p>
        </div>

        {status !== 'done' && (
          <div className="bition-form">
            <label className="bition-field">
              <span>手機號碼</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="請輸入手機號碼"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="bition-field">
              <span>登入密碼</span>
              <input
                type="password"
                placeholder="請設定登入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="bition-field">
              <span>確認密碼</span>
              <input
                type="password"
                placeholder="請再次輸入密碼"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            <label className="bition-field">
              <span>推薦碼</span>
              <input type="text" value="EMILY88" readOnly />
            </label>

            <button type="button" className="consent-row" onClick={() => setAgreed((v) => !v)}>
              <span className="consent-mark">{agreed ? '✓' : '○'}</span>
              <span>我已閱讀並同意《使用者服務協議》與《風險揭露聲明》</span>
            </button>

            {status === 'form' && (
              <button type="button" className="bition-btn-primary" disabled={!canSubmit} onClick={createAccount}>
                建立帳戶
              </button>
            )}
            {status === 'creating' && (
              <button type="button" className="bition-btn-primary" disabled>
                建立中……
              </button>
            )}
          </div>
        )}

        {status === 'done' && (
          <div className="bition-success">
            <div className="bition-success-check">✓</div>
            <p>帳戶建立成功</p>
          </div>
        )}
      </div>
    </div>
  );
}
