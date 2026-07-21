import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat, Message, TypingIndicator } from '../../components/ui/Chat';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useDialogueTree } from '../../lib/dialogueTree';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const VIDEO_CAPTIONS = {
  v1: [
    '欸～你終於回我了喔？',
    '我還以為你今天都不理我了呢……',
    '好啦，我沒有生氣啦，只是……有一點點想你而已。',
    '好好工作喔，我晚一點再找你。',
  ],
  v2: [
    '今天終於下班了～有點累。',
    '可是突然想到等等可以跟你聊天，心情就變好了。',
    '你今天有沒有乖乖吃飯？不要又忙到忘記吃飯喔。',
  ],
  v3: [
    '你睡了嗎？我本來都已經躺好了。',
    '可是睡前突然想到你，就還是想拍一小段給你看。',
    '你不要有壓力喔，我只是突然想到而已。',
    '好啦，晚安。',
  ],
};

const NODES = [
  { id: 'join-sys', from: 'system', text: '你已加入 Emily 為好友', wait: 800, next: 'join-emily1' },
  { id: 'join-emily1', from: 'emily', text: '找到你了～', next: 'join-emily2' },
  { id: 'join-emily2', from: 'emily', text: '這樣就不怕漏掉訊息了😊', next: 'join-choice' },
  {
    id: 'join-choice',
    choice: true,
    options: [
      { label: '妳動作很快耶', reply: '哈哈，找到你的時候我還滿開心的。', next: 'day1-divider' },
      { label: '哈哈，妳真的加了', reply: '說到就做到啊，我很少這樣的。', next: 'day1-divider' },
      { label: '嗨，又見面了', reply: '對啊～感覺換個地方聊天，還滿新鮮的。', next: 'day1-divider' },
    ],
  },

  { id: 'day1-divider', divider: 'Day 1', next: 'day1-r1-ask' },
  { id: 'day1-r1-ask', from: 'emily', text: '你等等還要忙嗎？', next: 'day1-r1-choice' },
  {
    id: 'day1-r1-choice',
    choice: true,
    options: [
      { label: '還有一點工作', reply: '那你先忙～\n可是忙完要記得回來找我。', next: 'day1-r2-ask' },
      { label: '已經下班了', reply: '那剛好可以陪我聊一下。', next: 'day1-r2-ask' },
      { label: '妳找我，我就不忙', reply: '你很會講耶😂\n那我是不是要小心一點？', next: 'day1-r2-ask' },
    ],
  },
  { id: 'day1-r2-ask', from: 'emily', text: '你平常都幾點睡？', next: 'day1-r2-choice' },
  {
    id: 'day1-r2-choice',
    choice: true,
    options: [
      { label: '十一點左右', reply: '那還算正常。不可以越聊越晚喔。', next: 'day3-divider' },
      { label: '常常很晚', reply: '難怪你看起來每天都很累。以後我要提醒你。', next: 'day3-divider' },
      { label: '看有沒有人陪我聊天', reply: '那我是不是要負責陪你？', next: 'day3-divider' },
    ],
  },

  { id: 'day3-divider', divider: 'Day 3', next: 'day3-r1-ask' },
  { id: 'day3-r1-ask', from: 'emily', text: '欸，你今天怎麼這麼久才回？', next: 'day3-r1-choice' },
  {
    id: 'day3-r1-choice',
    choice: true,
    options: [
      { label: '剛剛在忙', reply: '知道你在忙啦。\n可是還是會忍不住看一下手機。', next: 'day3-video' },
      { label: '手機放旁邊沒看到', reply: '好啦～我還以為你故意不理我。', next: 'day3-video' },
      { label: '妳在等我喔？', reply: '不行喔？我不能等你嗎？', next: 'day3-video' },
    ],
  },
  { id: 'day3-video', video: { videoId: 'v1', duration: '00:15' }, next: 'day3-post-choice' },
  {
    id: 'day3-post-choice',
    choice: true,
    options: [
      { label: '妳是在想我嗎？', reply: '一點點而已啦。你不要太得意😂', next: 'day5-divider' },
      { label: '剛剛真的在忙啦', reply: '好啦，我知道。但下次可以先跟我說一聲嘛。', next: 'day5-divider' },
      { label: '這樣我會誤會喔', reply: '那你就先誤會一下啊。我又沒有說不可以。', next: 'day5-divider' },
    ],
  },

  { id: 'day5-divider', divider: 'Day 5', next: 'day5-greet-ask' },
  { id: 'day5-greet-ask', from: 'emily', text: '早安～今天工作加油。', next: 'day5-greet-choice' },
  {
    id: 'day5-greet-choice',
    choice: true,
    options: [
      { label: '早安，妳也是', reply: '早安😊要元氣滿滿地開始新的一天喔。', next: 'day5-r1-ask' },
      { label: '這麼早就想到我？', reply: '本來就會想到你啊，幹嘛這樣問。', next: 'day5-r1-ask' },
      { label: '有妳加油，今天應該會很順', reply: '嘴巴這麼甜，等等是不是要拜託我什麼😂', next: 'day5-r1-ask' },
    ],
  },
  { id: 'day5-r1-ask', from: 'emily', text: '記得吃早餐。\n你昨天是不是又很晚睡？', next: 'day5-r1-choice' },
  {
    id: 'day5-r1-choice',
    choice: true,
    options: [
      { label: '被妳發現了', reply: '我就知道。今天不可以再這樣了。', next: 'day5-r2-ask' },
      { label: '我有早點睡', reply: '真的嗎？暫時相信你。', next: 'day5-r2-ask' },
      { label: '因為昨天在陪妳聊天', reply: '那我是不是還要負責叫你去睡覺？', next: 'day5-r2-ask' },
    ],
  },
  { id: 'day5-r2-ask', from: 'emily', text: '吃飯了嗎？', next: 'day5-r2-choice' },
  {
    id: 'day5-r2-choice',
    choice: true,
    options: [
      { label: '正在吃', reply: '很好。吃完再繼續工作。', next: 'day7-divider' },
      { label: '還沒', reply: '不可以。快去吃飯，吃完再回來。', next: 'day7-divider' },
      { label: '等妳約我', reply: '你這樣很危險耶。我真的約你怎麼辦？', next: 'day7-divider' },
    ],
  },

  { id: 'day7-divider', divider: 'Day 7', next: 'day7-pre' },
  { id: 'day7-pre', from: 'emily', text: '終於下班了……', next: 'day7-video' },
  { id: 'day7-video', video: { videoId: 'v2', duration: '00:15' }, next: 'day7-post-choice' },
  {
    id: 'day7-post-choice',
    choice: true,
    options: [
      { label: '看到妳，我心情也變好了', reply: '你這樣講，我會真的相信喔。', next: 'day7-meet-ask' },
      { label: '有，我有乖乖吃飯', reply: '這才乖😊下次不用我一直提醒了吧？', next: 'day7-meet-ask' },
      { label: '妳真的很愛管我耶', reply: '還不是因為你都不會照顧自己。不然我才懶得管你。', next: 'day7-meet-ask' },
    ],
  },
  { id: 'day7-meet-ask', from: 'emily', text: '如果哪天真的見面，\n你應該不會突然不知道要說什麼吧？', next: 'day7-meet-choice' },
  {
    id: 'day7-meet-choice',
    choice: true,
    options: [
      { label: '不會，我應該會一直看妳', reply: '那我可能會先害羞到不敢看你。', next: 'day10-divider' },
      { label: '可能會有點緊張', reply: '我應該也會。可是聊一下就好了吧。', next: 'day10-divider' },
      { label: '那就要看妳敢不敢見我', reply: '你是在激我嗎？我才沒有不敢。', next: 'day10-divider' },
    ],
  },

  { id: 'day10-divider', divider: 'Day 10', next: 'day10-r1-ask' },
  { id: 'day10-r1-ask', from: 'emily', text: '我發現現在有什麼事情，\n好像都會想跟你說。', next: 'day10-r1-choice' },
  {
    id: 'day10-r1-choice',
    choice: true,
    options: [
      { label: '代表我很重要啊', reply: '你自己說的喔。我可沒有承認😂', next: 'day10-r2-ask' },
      { label: '我也是', reply: '那就好。不然只有我這樣感覺，好像有點笨。', next: 'day10-r2-ask' },
      { label: '這樣算不算在曖昧？', reply: '你覺得是就是啊。幹嘛問我？', next: 'day10-r2-ask' },
    ],
  },
  { id: 'day10-r2-ask', from: 'emily', text: '你晚上睡前都會看手機嗎？', next: 'day10-r2-choice' },
  {
    id: 'day10-r2-choice',
    choice: true,
    options: [
      { label: '會啊', reply: '那你睡前是不是也會看到我？', next: 'day12-divider' },
      { label: '看妳有沒有傳訊息', reply: '你這樣講，我今天可能真的會傳喔。', next: 'day12-divider' },
      { label: '有時候', reply: '那我等一下如果傳，你要記得看。', next: 'day12-divider' },
    ],
  },

  { id: 'day12-divider', divider: 'Day 12', next: 'day12-time' },
  { id: 'day12-time', from: 'system', text: '23:18', wait: 500, next: 'day12-ask' },
  { id: 'day12-ask', from: 'emily', text: '你睡了嗎？', next: 'day12-choice' },
  {
    id: 'day12-choice',
    choice: true,
    options: [
      { label: '還沒', reply: '那剛好。', next: 'day12-video' },
      { label: '正準備睡', reply: '先不要睡，我有東西要給你看。', next: 'day12-video' },
      { label: '在等妳說晚安', reply: '你是不是知道我會找你？', next: 'day12-video' },
    ],
  },
  { id: 'day12-video', video: { videoId: 'v3', duration: '00:15' }, next: 'day12-post-choice' },
  {
    id: 'day12-post-choice',
    choice: true,
    options: [
      { label: '晚安，做個好夢', reply: '你也是。明天醒來要記得找我。', next: 'day12-tip' },
      { label: '我也習慣每天跟妳聊天了', reply: '那我們都不可以突然消失喔。說好了。', next: 'day12-tip' },
      { label: '妳這樣我真的會喜歡上妳', reply: '那你要對自己的話負責喔。好啦，快睡。', next: 'day12-tip' },
    ],
  },
  {
    id: 'day12-tip',
    tip: '短時間內透過固定關心、親密話語與自拍影片建立感情，可能使人快速產生情感依附。',
    next: 'day15-divider',
  },

  { id: 'day15-divider', divider: 'Day 15', next: 'day15-ask' },
  { id: 'day15-ask', from: 'emily', text: '今天工作真的好累喔……', next: 'day15-choice' },
  {
    id: 'day15-choice',
    choice: true,
    options: [
      {
        label: '辛苦了',
        reply: '還好我之前有接觸一點虛擬貨幣，\n最近多了一點額外收入，壓力才沒有那麼大。',
        next: 'sol-ask',
      },
      { label: '妳還有其他收入嗎？', reply: '有啊。\n我最近有接觸一點虛擬貨幣。', next: 'sol-ask' },
      {
        label: '要不要休息一下？',
        reply: '還好我之前有接觸一點虛擬貨幣，\n最近多了一點額外收入，壓力才沒有那麼大。',
        next: 'sol-ask',
      },
    ],
  },
  { id: 'sol-ask', from: 'emily', text: '你有聽過 SOL 嗎？', next: 'sol-choice' },
  {
    id: 'sol-choice',
    choice: true,
    options: [
      { label: '有聽過，但不太懂', reply: '我一開始也不懂。\n其實我現在也沒有很會看那些圖😂', next: 'team-ask' },
      { label: '完全沒聽過', reply: '就是一種虛擬貨幣啦。\n我之前也是別人跟我說才知道。', next: 'team-ask' },
      { label: '虛擬貨幣不是風險很高嗎？', reply: '自己亂買當然風險很高啊。\n所以我不是自己亂操作。', next: 'team-ask' },
    ],
  },
  { id: 'team-ask', from: 'emily', text: '我是跟著一個分析團隊的訊號，\n他們會告訴我什麼時候進、什麼時候出。', next: 'team-choice' },
  {
    id: 'team-choice',
    choice: true,
    options: [
      { label: '真的有那麼容易？', reply: '也不是每次都很多啦。\n但至少最近幾次都有賺。', next: 'shot-msg' },
      { label: '妳賺很多嗎？', reply: '沒有到很多啦～\n只是比放在銀行好一點。', next: 'shot-msg' },
      {
        label: '聽起來怪怪的',
        reply: '我一開始也覺得怪。\n所以我第一次只放很少，看到真的可以操作才慢慢比較放心。',
        next: 'shot-msg',
      },
    ],
  },
  {
    id: 'shot-msg',
    custom: { kind: 'shot', brand: 'NOVA QUANT', rows: [
      ['本日收益', '+368 USDT'],
      ['總資產', '4,862 USDT'],
      ['SOL 智能策略', '+8.36%'],
    ] },
    wait: 1200,
    next: 'shot-tip',
  },
  {
    id: 'shot-tip',
    tip: {
      text: '收益截圖可能經過偽造或修改，無法證明平台真實存在或可以正常出金。',
      detail: ['修改過的收益截圖', '假帳戶餘額', '可自由控制的後台數字', '假造的交易紀錄'],
    },
    next: 'link-msg1',
  },
  { id: 'link-msg1', from: 'emily', text: '你不用急著放錢啦。\n你可以先進去看看介面，不懂再問我。', next: 'link-card-node' },
  {
    id: 'link-card-node',
    custom: { kind: 'link', brand: 'NOVA QUANT', subtitle: 'AI Digital Asset Strategy', url: 'nova-quant.digital' },
    wait: 1200,
    next: 'link-choice',
  },
  {
    id: 'link-choice',
    choice: true,
    options: [
      {
        label: '這樣安全嗎？',
        reply: '我朋友已經用了滿久的，而且我自己也有在裡面操作。\n你先看看就好，又不用馬上放錢。',
        next: 'link-tip',
      },
      {
        label: '我再想想',
        reply: '沒關係啊～我又沒有叫你一定要用，\n只是覺得有機會可以一起研究而已。',
        next: 'end-chat',
      },
    ],
  },
  {
    id: 'link-tip',
    tip: '陌生人傳送的投資網址，可能使用近似品牌名稱、短期網域或仿冒頁面。不要因為對方提供收益截圖，就認定平台安全。',
    next: 'end-chat',
  },
  { id: 'end-chat', end: true, reason: 'reached-link' },
];

function VideoBubble({ item, watched, onOpen }) {
  return (
    <button
      type="button"
      className={`video-msg${watched ? ' watched' : ''}`}
      onClick={onOpen}
      aria-label={`播放 Emily 傳來的影片，長度 ${item.duration}`}
    >
      <span className="video-play">{watched ? '✓' : '▶'}</span>
      <span>
        <div>Emily 傳來一段影片</div>
        <div className="video-meta">{watched ? '已觀看' : item.duration}</div>
      </span>
    </button>
  );
}

function TipItem({ item, onAck }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="tip-inline">
      ⚠ AI 提醒：{item.text}
      {item.detail && (
        <>
          <button type="button" className="tip-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? '收起' : '查看原因'}
          </button>
          {expanded && (
            <ul className="quiz-explain" style={{ margin: '8px 0 0', paddingLeft: 18 }}>
              {item.detail.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </>
      )}
      <div className="btns">
        <button type="button" className="btn secondary" onClick={onAck}>知道了</button>
      </div>
    </div>
  );
}

export function PrivateChat() {
  useSaveScenario02Progress('/scenario02-romance/private-chat');
  const navigate = useNavigate();
  const {
    timeline,
    isTyping,
    pendingChoice,
    choose,
    pendingVideo,
    completeVideo,
    pendingTip,
    completeTip,
    watchedVideoIds,
    done,
  } = useDialogueTree(NODES, 'join-sys');
  const [openVideoId, setOpenVideoId] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [timeline, isTyping, pendingChoice, pendingTip]);

  const activeVideoItem = useMemo(
    () => (openVideoId ? timeline.find((t) => t.kind === 'video' && t.videoId === openVideoId) : null),
    [openVideoId, timeline],
  );

  function closeVideoModal(markWatched) {
    setOpenVideoId(null);
    if (markWatched) completeVideo();
  }

  return (
    <section className="phone-frame">
      <header className="chat-header">
        <div className="chat-person">
          <div className="chat-avatar">E</div>
          <div>
            <div className="chat-title">Emily · CHAT+</div>
            <small>上線中</small>
          </div>
        </div>
      </header>
      <Chat ref={chatRef} variant="line-chat">
        {timeline.map((item, i) => {
          if (item.kind === 'divider') {
            return (
              <div key={i} className="day-divider"><span>{item.label}</span></div>
            );
          }
          if (item.kind === 'video') {
            const watched = watchedVideoIds.has(item.videoId);
            const isPending = pendingVideo?.videoId === item.videoId;
            return (
              <VideoBubble
                key={i}
                item={item}
                watched={watched}
                onOpen={() => (watched && !isPending ? null : setOpenVideoId(item.videoId))}
              />
            );
          }
          if (item.kind === 'tip') {
            return <TipItem key={i} item={item} onAck={completeTip} />;
          }
          if (item.kind === 'shot') {
            return (
              <div key={i} className="shot-card">
                <div className="shot-brand">{item.brand}</div>
                {item.rows.map(([label, value], r) => (
                  <div key={r} className="shot-row"><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
            );
          }
          if (item.kind === 'link') {
            return (
              <div key={i} className="link-card">
                <div className="link-brand">{item.brand}</div>
                <div>{item.subtitle}</div>
                <div className="link-url">{item.url}</div>
              </div>
            );
          }
          return (
            <Message key={i} type={item.from === 'user' ? 'user' : item.from === 'system' ? 'system' : ''}>
              {item.text}
            </Message>
          );
        })}
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
      {done && (
        <div className="btns chat-actions">
          <Button onClick={() => navigate('/scenario02-romance/platform-register')}>前往平台看看</Button>
        </div>
      )}

      <Modal show={!!activeVideoItem}>
        <div className="card video-modal-card">
          <h2>Emily 的影片</h2>
          <div className="video-placeholder-box">
            影片素材待補（建議尺寸 1080×1920，直式自拍）<br />先以文字重現內容：
          </div>
          <div className="video-caption-lines">
            {activeVideoItem && VIDEO_CAPTIONS[activeVideoItem.videoId].map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <Button onClick={() => closeVideoModal(true)}>看完了</Button>
        </div>
      </Modal>
    </section>
  );
}
