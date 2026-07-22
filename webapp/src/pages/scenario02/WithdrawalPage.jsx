import { useEffect, useState } from 'react';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const VERIFY_STEPS = ['帳戶驗證完成', '交易紀錄驗證完成', '資產來源驗證中'];

export function WithdrawalPage() {
  useSaveScenario02Progress('/scenario02-romance/withdrawal');
  const [method, setMethod] = useState('twd');
  const [phase, setPhase] = useState('form');
  const [verifyIndex, setVerifyIndex] = useState(-1);

  useEffect(() => {
    if (phase !== 'verifying') return undefined;
    if (verifyIndex >= VERIFY_STEPS.length - 1) {
      const t = setTimeout(() => setPhase('paused'), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVerifyIndex((i) => i + 1), 850);
    return () => clearTimeout(t);
  }, [phase, verifyIndex]);

  return (
    <>
      <TopBar brand="NOVA QUANT" />
      <Platform>
        <h2>申請出金</h2>
        <Stat label="帳戶總資產" value="4,782.60 USDT" />
        <Stat label="折合約" value="NT$150,862" />

        {phase === 'form' && (
          <>
            <div className="btns" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button className={`btn ${method === 'twd' ? '' : 'secondary'}`} type="button" onClick={() => setMethod('twd')}>
                台幣銀行帳戶
              </button>
              <button className={`btn ${method === 'usdt' ? '' : 'secondary'}`} type="button" onClick={() => setMethod('usdt')}>
                USDT 錢包
              </button>
            </div>
            {method === 'twd' ? (
              <Stat label="收款帳戶" value="銀行帳戶 •••• 8821" />
            ) : (
              <Stat label="收款錢包" value="TRX9••••••••DEMO" />
            )}
            <Stat label="提領金額" value="全部提領" />
            <Button onClick={() => setPhase('verifying')}>申請全部提領</Button>
          </>
        )}

        {phase === 'verifying' && (
          <>
            <h2 style={{ marginTop: 16 }}>正在進行風險審核……</h2>
            <ul className="step-status-list">
              {VERIFY_STEPS.map((step, i) => (
                <li key={step} className={i <= verifyIndex ? 'done' : ''}>
                  <span className="dot" /> {step}
                </li>
              ))}
            </ul>
          </>
        )}

        {phase === 'paused' && (
          <div className="warning" style={{ marginTop: 16 }}>
            <h2>提領暫停</h2>
            <p>您的提領申請目前無法完成。</p>
            <Button variant="danger" to="/scenario02-romance/guarantee">查看原因</Button>
          </div>
        )}
      </Platform>
    </>
  );
}
