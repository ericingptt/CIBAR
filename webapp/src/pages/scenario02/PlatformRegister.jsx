import { useState } from 'react';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

export function PlatformRegister() {
  useSaveScenario02Progress('/scenario02-romance/platform-register');
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [status, setStatus] = useState('form');

  function createAccount() {
    setStatus('creating');
    setTimeout(() => setStatus('done'), 1000);
  }

  return (
    <>
      <TopBar brand="NOVA QUANT" />
      <Platform>
        <h2>會員註冊</h2>
        <p className="mini">AI Digital Asset Strategy</p>
        <Stat label="使用者名稱" value="guest_0218" />
        <Stat label="密碼" value="••••••••" />
        <Stat label="確認密碼" value="••••••••" />
        <Stat label="推薦碼（不可修改）" value="EMILY88" />

        {status === 'form' && (
          <>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0', fontSize: 15, color: 'var(--muted)' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              我已閱讀
              <button
                type="button"
                onClick={() => setShowTerms((v) => !v)}
                style={{ background: 'none', border: 0, color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}
              >
                服務條款
              </button>
            </label>
            {showTerms && (
              <div className="tip-inline" style={{ background: 'rgba(255,255,255,.06)', color: 'var(--muted)', border: '1px solid var(--line)' }}>
                「平台將依據市場狀況提供數位資產服務。相關收益依照系統策略呈現。」
                <div style={{ marginTop: 8, color: '#ffd166' }}>
                  ⚠ AI 提示：條款內容模糊，未清楚標示公司、監管機構與風險。
                </div>
              </div>
            )}
            <Button onClick={createAccount} disabled={!agreed} style={{ opacity: agreed ? 1 : 0.5 }}>
              立即建立帳戶
            </Button>
          </>
        )}

        {status === 'creating' && <p>正在建立帳戶……</p>}

        {status === 'done' && (
          <div style={{ marginTop: 16 }}>
            <p>✅ 帳戶建立成功</p>
            <Button to="/scenario02-romance/platform-home">進入平台首頁</Button>
          </div>
        )}
      </Platform>
    </>
  );
}
