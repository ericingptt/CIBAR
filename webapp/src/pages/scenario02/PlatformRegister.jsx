import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, savePlatformState } from '../../lib/scenario02Store';

// A hand-gesture-only player has no keyboard and shouldn't ever summon a
// mobile virtual one, so this is a "simulated quick sign-up": every field
// is pre-filled and purely a display card (not an <input>, so there's
// nothing to focus and no keyboard risk), the terms line is pre-agreed
// text rather than a checkbox, and the only real control is one big
// "建立帳戶" button - always tappable from the start, no gating.
const FIELDS = [
  { label: '手機號碼', value: '0965 165 165' },
  { label: '登入密碼', value: '********' },
  { label: '確認密碼', value: '********' },
  { label: '推薦碼', value: 'EMILY88' },
];

export function PlatformRegister() {
  useSaveScenario02Progress('/scenario02-romance/platform-register');
  useStageClassName('bition-stage');
  const navigate = useNavigate();
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

  return (
    <div className="bition-app">
      <div className="bition-register-scroll">
        <div className="bition-logo-block">
          <div className="bition-logo">
            幣勝客
            <span>BITION</span>
          </div>
          <p className="bition-tagline">模擬快速註冊</p>
        </div>

        {status !== 'done' && (
          <div className="bition-form">
            {FIELDS.map((f) => (
              <div className="bition-display-field" key={f.label}>
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </div>
            ))}

            <div className="bition-terms-static">✓ 已閱讀並同意《使用者服務協議》與《風險揭露聲明》</div>

            {status === 'form' && (
              <button type="button" className="bition-btn-primary" onClick={createAccount}>建立帳戶</button>
            )}
            {status === 'creating' && (
              <button type="button" className="bition-btn-primary" disabled>建立中……</button>
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
