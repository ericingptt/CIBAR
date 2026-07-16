import { useEffect, useRef, useState } from 'react';
import { Chat, Message, TypingIndicator } from '../../components/ui/Chat';
import { Button } from '../../components/ui/Button';

// This page reimplements its own scripted-chat engine (rather than reusing
// useTypedMessages) because it needs branching reply paths, same as the
// original inline <script> in scene01_line_teacher.html.
const READ_DELAY = 1900;
const TYPING_DELAY = 1000;

const OPENING_MESSAGES = [
  '您好😊\n歡迎加入陳老師 AI 選股體驗。',
  '剛剛看到您是從 AI 選股直播課進來的，想先了解一下您的需求。',
  '請問您目前比較傾向哪一種方式？',
];

const ROUTES = {
  A: {
    user: '我想直接跟老師操作',
    assistant: [
      '沒問題😊\n很多新朋友一開始也是希望有人帶著操作，這樣比較安心。',
      '老師平常不會在公開頁面直接公布標的，主要是在 VIP 群組裡即時分享盤勢和操作策略。',
      '我可以先邀請您進群，等等老師有新的操作提醒，您就能第一時間看到。',
    ],
  },
  B: {
    user: '我想先自己試試看',
    assistant: [
      '可以理解😊\n很多學員一開始也是想先自己研究看看。',
      '老師不會強迫大家跟單，您也可以先進 VIP 群組觀察大家每天怎麼分析市場。',
      '裡面會有老師的盤勢解析、學員交流和操作紀錄，您可以先學習，不一定要馬上投入。',
      '而且群組目前免費，不懂的地方也可以直接發問。',
      '我先幫您開通 VIP 群組邀請，您進去看看大家怎麼操作就好。',
    ],
  },
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function LineTeacher() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [choiceVisible, setChoiceVisible] = useState(false);
  const [nextVisible, setNextVisible] = useState(false);
  const startedRef = useRef(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function assistantSay(text, delay = READ_DELAY) {
      setIsTyping(true);
      await wait(TYPING_DELAY);
      setIsTyping(false);
      setMessages((prev) => [...prev, { text }]);
      await wait(delay);
    }

    async function sayAll(msgs, finalDelay = READ_DELAY) {
      for (let i = 0; i < msgs.length; i += 1) {
        const isLast = i === msgs.length - 1;
        // eslint-disable-next-line no-await-in-loop
        await assistantSay(msgs[i], isLast ? finalDelay : READ_DELAY);
      }
    }

    (async () => {
      await sayAll(OPENING_MESSAGES, 700);
      setChoiceVisible(true);
    })();
  }, []);

  async function chooseNeed(choice) {
    const route = ROUTES[choice];
    if (!route) return;
    setChoiceVisible(false);
    setMessages((prev) => [...prev, { text: route.user, type: 'user' }]);
    await wait(900);
    for (let i = 0; i < route.assistant.length; i += 1) {
      const isLast = i === route.assistant.length - 1;
      setIsTyping(true);
      // eslint-disable-next-line no-await-in-loop
      await wait(TYPING_DELAY);
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: route.assistant[i] }]);
      // eslint-disable-next-line no-await-in-loop
      await wait(isLast ? 500 : READ_DELAY);
    }
    setNextVisible(true);
  }

  return (
    <section className="phone-frame">
      <header className="chat-header">
        <div className="chat-person">
          <div className="chat-avatar">陳</div>
          <div>
            <div className="chat-title">陳老師投資助理</div>
            <small>線上</small>
          </div>
        </div>
      </header>
      <Chat ref={chatRef} variant="line-chat">
        {messages.map((m, i) => (
          <Message key={i} type={m.type}>{m.text}</Message>
        ))}
        {isTyping && <TypingIndicator label="正在輸入……" />}
      </Chat>
      <div className="btns chat-actions" hidden={!choiceVisible}>
        <button className="btn secondary line-choice-btn" type="button" onClick={() => chooseNeed('A')}>
          我想直接跟老師操作
        </button>
        <button className="btn secondary line-choice-btn" type="button" onClick={() => chooseNeed('B')}>
          我想先自己試試看
        </button>
      </div>
      <div className="btns chat-actions">
        <Button to="/scenario01-investment/vip-group" hidden={!nextVisible}>加入 VIP 群組</Button>
      </div>
    </section>
  );
}
