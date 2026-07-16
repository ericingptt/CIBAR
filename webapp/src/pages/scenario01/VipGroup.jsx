import { useState } from 'react';
import { TopBar } from '../../shell/TopBar';
import { Chat, Message, TypingIndicator } from '../../components/ui/Chat';
import { Button } from '../../components/ui/Button';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Modal } from '../../components/ui/Modal';
import { useTypedMessages } from '../../lib/typedMessages';

const MESSAGES = [
  { text: '你已加入群組。', type: 'system', delay: 800 },
  { text: '陳老師：今天盤勢很漂亮，AI 模型剛剛抓到一檔短線標的。' },
  { text: '小林助理：新朋友可以先觀察，老師等等會公布操作方向。' },
  { text: '阿凱：我昨天跟老師那檔，今天開盤就拉上去了，真的有點誇張。' },
  { text: 'Jenny：我剛剛試著出金，已經入帳了，謝謝老師。' },
  { text: '股海小白：原本只是進來看看，沒想到三天就有收益。' },
  { text: '王先生：我今天先小額跟 1 萬，想先試水溫。' },
  { text: '小雅：早上看帳面多了 2,800，雖然不多但很有感。' },
  { text: '小林助理：目前下午場名額剩 12 位，還沒補資料的我會一對一提醒。', showVipWarning: true },
  { text: 'Kevin：昨天照老師提醒停利，剛剛本金跟獲利都回到帳戶了。' },
  { text: '財富自由ing：我先把上週獲利留下來，今天準備再加碼一點。' },
  { text: '陳老師：今天這檔不適合猶豫，下午 2 點前完成入金，晚上我會公布操作策略。' },
  { text: '小林助理：還沒完成註冊的新朋友，請先點下方連結開通帳戶。' },
  { text: '陳老師：完成平台註冊後把帳號截圖私訊助理，方便我安排今晚的操作名單。' },
];

export function VipGroup() {
  const [showWarning, setShowWarning] = useState(false);
  const { rendered, isTyping, done } = useTypedMessages(MESSAGES, {
    messageDelay: 1200,
    typingDelay: 650,
    onFlagged: () => setShowWarning(true),
  });

  return (
    <>
      <TopBar brand="陳老師 AI 飆股｜321 人" homeHref="/" />
      <Chat variant="vip-chat">
        {rendered.map((m, i) => (
          <Message key={i} type={m.type}>{m.text}</Message>
        ))}
        {isTyping && <TypingIndicator />}
      </Chat>
      <ButtonGroup>
        <Button to="/scenario01-investment/platform-register" hidden={!done}>前往註冊平台</Button>
      </ButtonGroup>

      <Modal show={showWarning}>
        <div className="warning">
          <h2>AI 提示</h2>
          <p>偵測到高風險投資訊息：<br />大量獲利截圖、短時間快速收益、成功出金回報。</p>
          <p>這類內容可能是詐騙集團安排的暗樁話術，<br />請勿僅依據群組訊息作為投資判斷。</p>
          <Button variant="danger" onClick={() => setShowWarning(false)}>繼續體驗</Button>
        </div>
      </Modal>
    </>
  );
}
