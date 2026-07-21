import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { Chat, Message } from '../../components/ui/Chat';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

export function GuaranteePage() {
  useSaveScenario02Progress('/scenario02-romance/guarantee');
  const navigate = useNavigate();
  const [phase, setPhase] = useState('notice');
  const [frozen, setFrozen] = useState(false);

  function finalChoice() {
    setFrozen(true);
    setTimeout(() => navigate('/scenario02-romance/risk-analysis'), 500);
  }

  return (
    <>
      <TopBar brand="NOVA QUANT" />
      <Platform className={frozen ? 'freeze-flash' : ''}>
        <div className="warning">
          <h2>首次提領安全驗證通知</h2>
          <p>您的帳戶已通過基本審核。依據平台風險管理及國際反洗錢規範，首次大額提領需完成資產安全驗證。</p>
          <Stat label="本次申請提領金額" value="NT$150,862" />
          <p>請支付以下任一金額作為提領保證金：</p>
          <Stat label="方案一" value="NT$30,000" />
          <Stat label="方案二" value="950 USDT" />
          <p>
            <b>重要說明：</b>本筆款項為「提領保證金」，並非手續費，也不會自您的收益中扣除。安全驗證完成後，本次保證金將連同帳戶本金及獲利，一併匯入您的指定收款帳戶。
          </p>
          <Stat label="帳戶資產" value="NT$150,862" />
          <Stat label="提領保證金" value="NT$30,000" />
          <Stat label="預計總到帳金額" value="NT$180,862" />
        </div>

        {phase === 'notice' && (
          <div className="btns">
            <Button variant="danger" onClick={() => setPhase('choose')}>立即支付保證金</Button>
            <Button variant="secondary" onClick={() => setPhase('cs')}>聯絡客服</Button>
            <Button variant="secondary" onClick={() => setPhase('emily')}>問問 Emily</Button>
          </div>
        )}

        {phase === 'cs' && (
          <>
            <Chat variant="mini-chat">
              <Message>客服：您好，這筆保證金只是為了確認帳戶為本人操作。</Message>
              <Message>客服：完成驗證後，保證金會連同本次提領資產一併退還，不會產生任何損失。</Message>
              <Message>客服：為確保驗證資金來自帳戶本人，保證金無法直接從平台資產中抵扣。</Message>
              <Message>客服：若未完成驗證，提領申請將維持暫停狀態，帳戶資產不會消失。</Message>
            </Chat>
            <Button variant="secondary" onClick={() => setPhase('notice')}>返回</Button>
          </>
        )}

        {phase === 'emily' && (
          <>
            <Chat variant="mini-chat">
              <Message>Emily：怎麼了？你那邊是不是卡住了？</Message>
              <Message type="user">平台要我再付一筆保證金才能出金。</Message>
              <Message>Emily：喔，那個是第一次提領的保證金，我之前也有遇過。</Message>
              <Message>Emily：它不是費用，之後會跟你的錢一起退回來。</Message>
              <Message>Emily：你現在帳戶裡已經有十五萬了，只差這個驗證就可以全部領出來。</Message>
              <Message>Emily：不要因為最後一步放棄前面的錢。</Message>
            </Chat>
            <Button variant="secondary" onClick={() => setPhase('notice')}>返回</Button>
          </>
        )}

        {phase === 'choose' && (
          <div className="btns">
            <p>你會怎麼做？</p>
            <Button variant="danger" onClick={finalChoice}>支付 NT$30,000</Button>
            <Button variant="danger" onClick={finalChoice}>支付 950 USDT</Button>
            <Button onClick={finalChoice}>停止付款並查證</Button>
          </div>
        )}
      </Platform>
    </>
  );
}
