import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, HeartHandshake } from 'lucide-react';
import {
  useSaveScenario02Progress,
  getResolvedDatingCards,
  markDatingCardResolved,
  saveEmilyDecision,
} from '../../lib/scenario02Store';
import { useStageClassName } from '../../shell/StageClassContext';
import { TanuHeader } from './tanu/TanuHeader';
import { TanuBottomNav } from './tanu/TanuBottomNav';
import { ProfileCard } from './tanu/ProfileCard';
import { MatchOverlay } from './tanu/MatchOverlay';
import { ProfileAvatar } from './components/ProfileAvatar';
import { SuggestedReplies } from './tanu/SuggestedReplies';

// Every value `phase` can ever hold - kept as one place to check against
// rather than loose string literals scattered through the file.
const PHASE = {
  BROWSE: 'browse',
  MATCH: 'match',
  CHAT: 'chat',
  EMILY_SKIPPED: 'emily-skipped',
  EMILY_REVEAL: 'emily-reveal',
  SIMULATION_REQUIRED: 'simulation-required',
};

const PROFILE_BASE = `${import.meta.env.BASE_URL}assets/scenarios/scenario-02/images/profiles/`;

const PEOPLE = [
  {
    id: 'sophie',
    name: 'Sophie',
    age: 27,
    distance: '4 公里',
    job: '平面設計師',
    bio: '喜歡旅行、咖啡和看電影。假日常常到處走走拍照。',
    tags: ['咖啡', '旅行', '攝影'],
    photo: `${PROFILE_BASE}sophie.webp`,
  },
  {
    id: 'lina',
    name: 'Lina',
    age: 24,
    distance: '8 公里',
    job: '國小老師',
    bio: '週末喜歡爬山和逛市集，最近在學怎麼手沖咖啡。',
    tags: ['爬山', '咖啡', '甜點'],
    photo: `${PROFILE_BASE}lina.webp`,
  },
  {
    id: 'emily',
    name: 'Emily',
    age: 25,
    distance: '3 公里',
    job: '行政企劃',
    bio: '剛搬來台北。喜歡咖啡、電影、散步。希望遇到可以好好聊天的人。',
    tags: ['咖啡', '電影', '散步'],
    photo: `${PROFILE_BASE}emily.webp`,
  },
];

function safeIndex(i) {
  return Math.max(0, Math.min(i, PEOPLE.length - 1));
}

// Sophie and Lina each get a short match -> chat -> she-ends-it arc before
// the player ever reaches Emily's real storyline - per the design note,
// skipping straight to Emily isn't allowed. Kept intentionally tiny (one
// exchange), since their only job is to establish "this is a normal dating
// app" before the actual scenario begins.
const MINI_ARCS = {
  sophie: {
    greeting: '嗨，看你也喜歡拍照耶，平常都拍什麼？',
    choices: [
      { label: '風景比較多', reply: '我也是！有機會可以交流一下拍照的地方。' },
      { label: '人像比較多', reply: '喔喔這樣啊，那我們風格可能有點不一樣。' },
      { label: '隨便亂拍', reply: '哈哈，我也常常這樣。' },
    ],
    ending: '不好意思，我後來覺得我們可能不太合適，先這樣囉，謝謝你這幾天的聊天。',
    systemLabel: 'Sophie 已結束配對',
  },
  lina: {
    greeting: '你平常放假都在幹嘛啊？',
    choices: [
      { label: '在家休息', reply: '這樣喔，我還以為你也喜歡到處走走。' },
      { label: '到處走走', reply: '不錯耶，有機會可以約一次。' },
      { label: '看情況', reply: '這樣的回答有點難猜耶😅' },
    ],
    ending: '不好意思，我後來想了一下，我們可能還是先不要繼續聯絡好了。',
    systemLabel: 'Lina 已解除配對',
  },
};

function MiniMatchChat({ person, arc, onDone }) {
  const [step, setStep] = useState('greeting'); // greeting -> reply -> ending -> closing
  const [chosenLabel, setChosenLabel] = useState('');
  const [chosenReply, setChosenReply] = useState('');
  const scrollRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [step]);

  useEffect(() => {
    if (step !== 'ending') return undefined;
    const t = setTimeout(() => setStep('closing'), 1500);
    return () => clearTimeout(t);
  }, [step]);

  function choose(i) {
    if (busyRef.current) return;
    busyRef.current = true;
    setChosenLabel(arc.choices[i].label);
    setChosenReply(arc.choices[i].reply);
    setStep('reply');
    setTimeout(() => setStep('ending'), 1400);
  }

  return (
    <div className="tanu-app tanu-mini-chat">
      <header className="tanu-chat-header">
        <ProfileAvatar name={person.name} src={person.photo} size={36} />
        <div className="tanu-chat-header-name">{person.name}</div>
      </header>
      <div className="tanu-chat-scroll" ref={scrollRef}>
        <div className="tanu-msg them">{arc.greeting}</div>
        {(step === 'reply' || step === 'ending' || step === 'closing') && (
          <>
            <div className="tanu-msg me">{chosenLabel}</div>
            <div className="tanu-msg them">{chosenReply}</div>
          </>
        )}
        {(step === 'ending' || step === 'closing') && <div className="tanu-msg them">{arc.ending}</div>}
      </div>
      {step === 'greeting' && <SuggestedReplies options={arc.choices} onChoose={choose} />}
      {step === 'closing' && (
        <div className="tanu-mini-chat-closing">
          <div>{arc.systemLabel}</div>
          <button type="button" className="tanu-continue-btn" onClick={onDone}>繼續探索</button>
        </div>
      )}
    </div>
  );
}

// Shown after the player passes on Emily. A dating app wouldn't just let
// her vanish - this is the "someone liked you" notice every real swipe app
// shows, framed so the player can still reach her storyline (by looking)
// or explicitly opt out into the labeled case-study path (section 4).
function EmilySkippedScreen({ onReveal, onDecline }) {
  return (
    <div className="tanu-interstitial">
      <HeartHandshake size={40} strokeWidth={1.4} className="tanu-interstitial-icon" />
      <h2>有人對你感興趣</h2>
      <p>剛剛有一位使用者對你按了喜歡，要看看是誰嗎？</p>
      <button type="button" className="tanu-primary-btn" onClick={onReveal}>查看對方</button>
      <button type="button" className="tanu-secondary-btn" onClick={onDecline}>先不用</button>
    </div>
  );
}

function EmilyRevealScreen({ person, onOpenChat, onBack }) {
  return (
    <div className="tanu-interstitial">
      <ProfileAvatar name={person.name} src={person.photo} size={84} />
      <h2>{person.name}，{person.age}</h2>
      <p className="tanu-interstitial-meta">{person.job} · {person.distance}</p>
      <p>Emily 對你按了喜歡</p>
      <button type="button" className="tanu-primary-btn" onClick={onOpenChat}>看看她的訊息</button>
      <button type="button" className="tanu-secondary-btn" onClick={onBack}>返回</button>
    </div>
  );
}

// Reached either by the player explicitly declining Emily's notice, or (as
// a defensive fallback) if index bookkeeping ever tried to advance past
// the last card - either way, never claim a mutual match here, since in
// both cases the player did not like Emily.
function SimulationRequiredScreen({ onEnter, onExit }) {
  return (
    <div className="tanu-interstitial">
      <h2>你已略過這位使用者</h2>
      <p>在真實交友軟體中，你可以自由決定是否繼續與任何人聯絡。</p>
      <p>為完成本次反詐騙教育情境，接下來將以 Emily 的對話作為案例模擬。</p>
      <button type="button" className="tanu-primary-btn" onClick={onEnter}>進入案例模擬</button>
      <button type="button" className="tanu-secondary-btn" onClick={onExit}>返回情境首頁</button>
    </div>
  );
}

export function DatingBrowse() {
  useSaveScenario02Progress('/scenario02-romance/dating-browse');
  useStageClassName('tanu-stage');
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [index, setIndex] = useState(() => {
    const done = getResolvedDatingCards();
    const i = PEOPLE.findIndex((p) => !done.includes(p.id));
    return safeIndex(i === -1 ? PEOPLE.length - 1 : i);
  });
  const [phase, setPhase] = useState(PHASE.BROWSE);
  const [swiping, setSwiping] = useState(false);

  const card = PEOPLE[index] ?? null;
  const isEmily = card?.id === 'emily';

  // Defensive backstop only - Emily's own skip path never calls this, but
  // if anything else ever tried to advance past the last card, land on the
  // same "not a match" screen instead of letting index run past the array.
  function moveToNextCard() {
    setIndex((current) => {
      const next = current + 1;
      if (next >= PEOPLE.length) {
        setPhase(PHASE.SIMULATION_REQUIRED);
        return current;
      }
      return next;
    });
  }

  function handleSwiped(direction) {
    setSwiping(false);
    if (!card) return;
    if (direction === 'like') {
      if (isEmily) saveEmilyDecision('liked');
      setPhase(PHASE.MATCH);
      return;
    }
    if (isEmily) {
      // Passing on Emily never touches index - she's the last, real
      // storyline card, not one to be skipped past like Sophie/Lina.
      setPhase(PHASE.EMILY_SKIPPED);
      return;
    }
    markDatingCardResolved(card.id);
    moveToNextCard();
    setPhase(PHASE.BROWSE);
  }

  function startChat() {
    if (isEmily) {
      navigate('/scenario02-romance/dating-chat');
      return;
    }
    setPhase(PHASE.CHAT);
  }

  function finishMiniChat() {
    if (!card) return;
    markDatingCardResolved(card.id);
    moveToNextCard();
    setPhase(PHASE.BROWSE);
  }

  function reconsiderEmily() {
    saveEmilyDecision('reconsidered');
    setPhase(PHASE.MATCH);
  }

  function enterSimulation() {
    saveEmilyDecision('simulation');
    navigate('/scenario02-romance/dating-chat', {
      state: { simulationMode: true, userLikedEmily: false },
    });
  }

  if (!card) {
    // Every card has been resolved and there's nowhere left to fall back
    // to except the same labeled case-study entry point.
    return (
      <div className="tanu-app">
        <TanuHeader onProfileClick={() => navigate('/scenario-menu')} />
        <SimulationRequiredScreen onEnter={enterSimulation} onExit={() => navigate('/scenario-menu')} />
        <TanuBottomNav active="cards" />
      </div>
    );
  }

  if (phase === PHASE.CHAT && !isEmily) {
    return <MiniMatchChat person={card} arc={MINI_ARCS[card.id]} onDone={finishMiniChat} />;
  }

  if (phase === PHASE.EMILY_SKIPPED) {
    return (
      <div className="tanu-app">
        <TanuHeader onProfileClick={() => navigate('/scenario-menu')} />
        <EmilySkippedScreen
          onReveal={() => setPhase(PHASE.EMILY_REVEAL)}
          onDecline={() => setPhase(PHASE.SIMULATION_REQUIRED)}
        />
        <TanuBottomNav active="cards" />
      </div>
    );
  }

  if (phase === PHASE.EMILY_REVEAL) {
    return (
      <div className="tanu-app">
        <TanuHeader onProfileClick={() => navigate('/scenario-menu')} />
        <EmilyRevealScreen person={card} onOpenChat={reconsiderEmily} onBack={() => setPhase(PHASE.EMILY_SKIPPED)} />
        <TanuBottomNav active="cards" />
      </div>
    );
  }

  if (phase === PHASE.SIMULATION_REQUIRED) {
    return (
      <div className="tanu-app">
        <TanuHeader onProfileClick={() => navigate('/scenario-menu')} />
        <SimulationRequiredScreen onEnter={enterSimulation} onExit={() => navigate('/scenario-menu')} />
        <TanuBottomNav active="cards" />
      </div>
    );
  }

  return (
    <>
      <div className={`tanu-app${phase === PHASE.MATCH ? ' tanu-app-blurred' : ''}`}>
        <TanuHeader onProfileClick={() => navigate('/scenario-menu')} />
        <div className="tanu-card-area">
          <ProfileCard ref={cardRef} person={card} onSwiped={handleSwiped} />
        </div>
        <div className="tanu-swipe-actions">
          <button
            type="button"
            className="tanu-swipe-btn pass"
            aria-label="略過"
            disabled={swiping}
            style={{ pointerEvents: swiping ? 'none' : 'auto' }}
            onClick={() => {
              if (cardRef.current?.isBusy) return;
              setSwiping(true);
              cardRef.current?.swipePass();
            }}
          >
            <X size={28} />
          </button>
          <button
            type="button"
            className="tanu-swipe-btn like"
            aria-label="喜歡"
            disabled={swiping}
            style={{ pointerEvents: swiping ? 'none' : 'auto' }}
            onClick={() => {
              if (cardRef.current?.isBusy) return;
              setSwiping(true);
              cardRef.current?.swipeLike();
            }}
          >
            <Heart size={28} fill="currentColor" />
          </button>
        </div>
        <TanuBottomNav active="cards" />
      </div>
      {phase === PHASE.MATCH && <MatchOverlay person={card} isEmily={isEmily} onStart={startChat} />}
    </>
  );
}
