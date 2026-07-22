import { useState } from 'react';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const AMOUNTS = [
  { twd: 3000, usdt: 94 },
  { twd: 5000, usdt: 157 },
  { twd: 10000, usdt: 315 },
];

export function DepositPage() {
  useSaveScenario02Progress('/scenario02-romance/deposit');
  const [method, setMethod] = useState('twd');
  const [amountIndex, setAmountIndex] = useState(2);
  const [status, setStatus] = useState('form');
  const amount = AMOUNTS[amountIndex];

  function confirmDeposit() {
    setStatus('confirming');
    setTimeout(() => setStatus('done'), 1500);
  }

  return (
    <>
      <TopBar brand="NOVA QUANT" />
      <Platform>
        <h2>資產入金</h2>

        {status === 'form' && (
          <>
            <div className="btns" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button className={`btn ${method === 'twd' ? '' : 'secondary'}`} type="button" onClick={() => setMethod('twd')}>
                台幣快捷入金
              </button>
              <button className={`btn ${method === 'usdt' ? '' : 'secondary'}`} type="button" onClick={() => setMethod('usdt')}>
                USDT 入金
              </button>
            </div>

            {method === 'twd' && (
              <>
                <div className="btns" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginTop: 16 }}>
                  {AMOUNTS.map((a, i) => (
                    <button
                      key={a.twd}
                      type="button"
                      className={`btn ${i === amountIndex ? '' : 'secondary'}`}
                      onClick={() => setAmountIndex(i)}
                    >
                      NT${a.twd.toLocaleString()}
                    </button>
                  ))}
                </div>
                <Stat label="預計到帳" value={`約 ${amount.usdt} USDT`} />
              </>
            )}

            {method === 'usdt' && (
              <div className="shot-card" style={{ margin: '16px 0' }}>
                <div className="shot-brand">模擬錢包地址</div>
                <div style={{ margin: '8px 0', fontFamily: 'monospace' }}>TRX9••••••••DEMO</div>
                <div style={{ color: 'var(--danger)', fontSize: 13 }}>僅供反詐教育模擬，不可轉帳。</div>
              </div>
            )}

            <Button onClick={confirmDeposit}>確認入金</Button>
            <p className="mini" style={{ marginTop: 12, textAlign: 'center' }}>
              此為情境模擬，不會產生真實交易。
            </p>
          </>
        )}

        {status === 'confirming' && <p>正在確認交易……</p>}

        {status === 'done' && (
          <div style={{ marginTop: 16 }}>
            <p>✅ 入金成功</p>
            <Button to="/scenario02-romance/trading">前往策略頁面</Button>
          </div>
        )}
      </Platform>
    </>
  );
}
