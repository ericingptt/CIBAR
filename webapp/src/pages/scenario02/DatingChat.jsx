import { useEffect, useRef, useState } from 'react';
import { Chat, Message, TypingIndicator } from '../../components/ui/Chat';
import { Button } from '../../components/ui/Button';
import { useDialogueTree } from '../../lib/dialogueTree';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const NODES = [
  { id: 'r1-ask', from: 'emily', text: '嗨～你今天過得怎麼樣？', next: 'r1-choice' },
  {
    id: 'r1-choice',
    choice: true,
    options: [
      { label: '還不錯，剛下班', reply: '辛苦了～\n下班之後要好好休息，不要又把工作帶回家喔。', next: 'r2-ask' },
      { label: '今天有點累', reply: '辛苦了🥺\n那你等等要早點休息，不可以又熬夜。', next: 'r2-ask' },
      { label: '普通，妳呢？', reply: '我今天也有點忙，\n但現在終於可以放鬆一下了。', next: 'r2-ask' },
    ],
  },
  { id: 'r2-ask', from: 'emily', text: '你平常下班之後都在做什麼？', next: 'r2-choice' },
  {
    id: 'r2-choice',
    choice: true,
    options: [
      { label: '看影片、打遊戲', reply: '聽起來很放鬆耶～\n你平常都看什麼？', next: 'r3-ask' },
      { label: '去運動', reply: '你居然會運動，好自律喔。\n不像我下班只想躺著😂', next: 'r3-ask' },
      { label: '在家休息', reply: '我也是～\n有時候下班只想躺著滑手機。', next: 'r3-ask' },
    ],
  },
  { id: 'r3-ask', from: 'emily', text: '不知道為什麼，\n跟你聊天感覺滿舒服的。', next: 'r3-choice' },
  {
    id: 'r3-choice',
    choice: true,
    options: [
      { label: '我也覺得', reply: '真的嗎？\n那我就放心了，我還怕只有我這樣覺得。', next: 't-ask' },
      { label: '我們才剛認識耶', reply: '對啊，明明才剛認識。\n可是有些人就是很容易聊得來，不是嗎？', next: 't-ask' },
      { label: '可能是我們頻率比較像', reply: '哈哈，我也覺得。\n跟有些人就是不用想太多，很自然就聊下去了。', next: 't-ask' },
    ],
  },
  { id: 't-ask', from: 'emily', text: '這邊有時候訊息會漏掉。\n你平常有用 CHAT+ 嗎？', next: 't-choice' },
  {
    id: 't-choice',
    choice: true,
    options: [
      { label: '有啊', reply: '那要不要加一下？\n這樣比較不會漏掉你的訊息。', next: 'join-prompt' },
      { label: '為什麼要換？', reply: '因為這邊通知常常不跳出來啦😂\n而且 CHAT+ 比較方便。不方便也沒關係喔。', next: 't-b-choice' },
      { label: '在這裡聊就好吧', reply: '好啊，也可以。\n我只是怕錯過你的訊息而已。', next: 't-filler-a' },
    ],
  },
  { id: 't-b-choice', choice: true, options: [
    { label: '加入 CHAT+', reply: null, next: 'join-prompt' },
    { label: '先繼續聊', reply: null, next: 't-filler-a' },
  ] },
  { id: 't-filler-a', from: 'emily', text: '對了，你平常假日都習慣做什麼？', next: 't-filler-b' },
  { id: 't-filler-b', from: 'emily', text: '感覺你應該很好相處，\n我剛搬來這邊，認識的人還沒有很多。', next: 't-5s-remind' },
  { id: 't-5s-remind', from: 'emily', text: '可是我等等要關掉這個 App 了🥺', wait: 900, next: 't-5s-choice' },
  {
    id: 't-5s-choice',
    choice: true,
    options: [
      { label: '加入 CHAT+', reply: null, next: 'join-prompt' },
      { label: '結束體驗', reply: null, next: 'end-declined' },
    ],
  },
  { id: 'join-prompt', end: true, reason: 'join' },
  { id: 'end-declined', end: true, reason: 'declined' },
];

export function DatingChat() {
  useSaveScenario02Progress('/scenario02-romance/dating-chat');
  const { timeline, isTyping, pendingChoice, choose, done, endReason } = useDialogueTree(NODES, 'r1-ask');
  // 'idle' -> 'tip' (shown right after joining CHAT+) -> 'ready' (tip
  // dismissed, either by the user or after ~4s, continue button revealed).
  // Dismissal and navigation are deliberately separate steps - an
  // auto-navigate timer racing the dismiss button was flaky to click.
  const [joinPhase, setJoinPhase] = useState('idle');
  const chatRef = useRef(null);
  const tipTimerRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [timeline, isTyping, pendingChoice]);

  function joinChatPlus() {
    setJoinPhase('tip');
    tipTimerRef.current = setTimeout(() => setJoinPhase('ready'), 4000);
  }

  function dismissTip() {
    clearTimeout(tipTimerRef.current);
    setJoinPhase('ready');
  }

  useEffect(() => () => clearTimeout(tipTimerRef.current), []);

  return (
    <section className="phone-frame">
      <header className="chat-header">
        <div className="chat-person">
          <div className="chat-avatar">E</div>
          <div>
            <div className="chat-title">Emily · SPARK</div>
            <small>已配對</small>
          </div>
        </div>
      </header>
      <Chat ref={chatRef} variant="line-chat">
        {timeline.map((item, i) => (
          <Message key={i} type={item.from === 'user' ? 'user' : item.from === 'system' ? 'system' : ''}>
            {item.text}
          </Message>
        ))}
        {isTyping && <TypingIndicator label="Emily 正在輸入……" />}
      </Chat>
      {pendingChoice && (
        <div className="btns chat-actions">
          {pendingChoice.options.map((opt, i) => (
            <button key={i} className="btn secondary line-choice-btn" type="button" onClick={() => choose(i)}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {done && endReason === 'join' && joinPhase === 'idle' && (
        <div className="btns chat-actions">
          <Button onClick={joinChatPlus}>加入 Emily 的 CHAT+</Button>
        </div>
      )}
      {done && endReason === 'declined' && joinPhase === 'idle' && (
        <div className="btns chat-actions">
          <p className="mini" style={{ marginBottom: 8 }}>
            你選擇中止與陌生人的聯絡。但實際案例中，許多人會因為對方表現自然、沒有立刻談錢，而選擇繼續聯絡。
          </p>
          <Button variant="secondary" to="/scanner">返回首頁</Button>
          <Button onClick={joinChatPlus}>繼續模擬</Button>
        </div>
      )}
      {joinPhase === 'tip' && (
        <div className="tip-inline">
          陌生人將對話導向私人通訊軟體，可能使對話離開原平台的檢舉與安全機制。
          <div className="btns">
            <button className="btn secondary" type="button" onClick={dismissTip}>知道了</button>
          </div>
        </div>
      )}
      {joinPhase === 'ready' && (
        <div className="btns chat-actions">
          <Button to="/scenario02-romance/private-chat">前往 CHAT+</Button>
        </div>
      )}
    </section>
  );
}
