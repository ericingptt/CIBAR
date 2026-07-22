import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDialogueTree } from '../../lib/dialogueTree';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';
import { useStageClassName } from '../../shell/StageClassContext';
import { ProfileAvatar } from './components/ProfileAvatar';
import { SuggestedReplies } from './tanu/SuggestedReplies';

const EMILY_PHOTO = `${import.meta.env.BASE_URL}assets/scenarios/scenario-02/images/profiles/emily.png`;

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
  { id: 't-ask', from: 'emily', text: '這邊有時候訊息會漏掉。\n你平常有用 LINE 嗎？', next: 't-choice' },
  {
    id: 't-choice',
    choice: true,
    options: [
      { label: '有啊', reply: '那要不要加一下？\n這樣比較不會漏掉你的訊息。', next: 'join-prompt' },
      { label: '為什麼要換？', reply: '因為這邊通知常常不跳出來啦😂\n而且 LINE 比較方便。不方便也沒關係喔。', next: 't-b-choice' },
      { label: '在這裡聊就好吧', reply: '好啊，也可以。\n我只是怕錯過你的訊息而已。', next: 't-filler-a' },
    ],
  },
  { id: 't-b-choice', choice: true, options: [
    { label: '加入 LINE', reply: null, next: 'join-prompt' },
    { label: '先繼續聊', reply: null, next: 't-filler-a' },
  ] },
  { id: 't-filler-a', from: 'emily', text: '對了，你平常假日都習慣做什麼？', next: 't-filler-b' },
  { id: 't-filler-b', from: 'emily', text: '感覺你應該很好相處，\n我剛搬來這邊，認識的人還沒有很多。', next: 't-5s-remind' },
  { id: 't-5s-remind', from: 'emily', text: '可是我等等要關掉這個 App 了🥺', wait: 900, next: 't-5s-choice' },
  {
    id: 't-5s-choice',
    choice: true,
    options: [
      { label: '加入 LINE', reply: null, next: 'join-prompt' },
      { label: '結束體驗', reply: null, next: 'end-declined' },
    ],
  },
  { id: 'join-prompt', end: true, reason: 'join' },
  { id: 'end-declined', end: true, reason: 'declined' },
];

// Only the last message in a run of consecutive same-sender bubbles shows a
// timestamp, matching normal chat-app conventions.
function isLastInGroup(timeline, i) {
  const next = timeline[i + 1];
  return !next || next.from !== timeline[i].from || next.kind !== 'msg';
}

function fakeTime(i) {
  const totalMinutes = 20 * 60 + 14 + i * 2;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function DatingChat() {
  useSaveScenario02Progress('/scenario02-romance/dating-chat');
  useStageClassName('tanu-stage');
  const navigate = useNavigate();
  const { timeline, isTyping, pendingChoice, choose, done, endReason } = useDialogueTree(NODES, 'r1-ask');
  // 'idle' -> 'tip' (shown right after joining LINE) -> 'ready' (tip
  // dismissed, either by the user or after ~4s, continue button revealed).
  const [joinPhase, setJoinPhase] = useState('idle');
  const [leaving, setLeaving] = useState(false);
  const scrollRef = useRef(null);
  const tipTimerRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [timeline, isTyping, pendingChoice]);

  function joinLine() {
    setJoinPhase('tip');
    tipTimerRef.current = setTimeout(() => setJoinPhase('ready'), 4000);
  }

  function dismissTip() {
    clearTimeout(tipTimerRef.current);
    setJoinPhase('ready');
  }

  useEffect(() => () => clearTimeout(tipTimerRef.current), []);

  function goToLine() {
    setLeaving(true);
    setTimeout(() => navigate('/scenario02-romance/private-chat'), 320);
  }

  return (
    <div className={`tanu-app tanu-chat-page${leaving ? ' tanu-chat-leaving' : ''}`}>
      <header className="tanu-chat-header">
        <ProfileAvatar name="Emily" src={EMILY_PHOTO} size={38} status="online" />
        <div>
          <div className="tanu-chat-header-name">Emily</div>
          <div className="tanu-chat-header-status">在線上</div>
        </div>
      </header>
      <div className="tanu-chat-scroll" ref={scrollRef}>
        {timeline.map((item, i) => {
          if (item.from === 'system') {
            return <div key={i} className="tanu-msg system">{item.text}</div>;
          }
          const mine = item.from === 'user';
          return (
            <div key={i} className={`tanu-msg-row${mine ? ' mine' : ''}`}>
              <div className={`tanu-msg ${mine ? 'me' : 'them'}`}>{item.text}</div>
              {isLastInGroup(timeline, i) && <span className="tanu-msg-time">{fakeTime(i)}</span>}
            </div>
          );
        })}
        {isTyping && <div className="tanu-typing"><i /><i /><i /></div>}
      </div>
      <footer className="tanu-chat-footer">
        {pendingChoice && <SuggestedReplies options={pendingChoice.options} onChoose={choose} />}
        {done && endReason === 'join' && joinPhase === 'idle' && (
          <button type="button" className="tanu-primary-btn" onClick={joinLine}>加入 Emily 的 LINE</button>
        )}
        {done && endReason === 'declined' && joinPhase === 'idle' && (
          <div className="tanu-declined-box">
            <p>你選擇中止與陌生人的聯絡。但實際案例中，許多人會因為對方表現自然、沒有立刻談錢，而選擇繼續聯絡。</p>
            <button type="button" className="tanu-secondary-btn" onClick={() => navigate('/scanner')}>返回首頁</button>
            <button type="button" className="tanu-primary-btn" onClick={joinLine}>繼續模擬</button>
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
          <button type="button" className="tanu-primary-btn" onClick={goToLine}>前往 LINE</button>
        )}
      </footer>
    </div>
  );
}
