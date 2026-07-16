import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';

export function PlatformRegister() {
  const [showDeposit, setShowDeposit] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <TopBar brand="A.I. Global Capital" homeHref="/" />
      <Platform>
        <h2>會員註冊</h2>
        <Stat label="手機號碼" value="09xx-xxx-xxx" />
        <Stat label="推薦碼" value="VIP6688" />
        <Button onClick={() => setShowDeposit(true)}>完成註冊</Button>
        {showDeposit && (
          <div style={{ marginTop: 20 }}>
            <h2>帳戶餘額：NT$0</h2>
            <p>系統提示：請依客服指示完成入金。</p>
            <Stat label="入金金額" value="NT$10,000" />
            <Button onClick={() => navigate('/scenario01-investment/profit')}>確認入金</Button>
          </div>
        )}
      </Platform>
    </>
  );
}
