import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart } from 'lucide-react';
import { useSaveScenario02Progress, getResolvedDatingCards, markDatingCardResolved } from '../../lib/scenario02Store';
import { useStageClassName } from '../../shell/StageClassContext';
import { TanuHeader } from './tanu/TanuHeader';
import { TanuBottomNav } from './tanu/TanuBottomNav';
import { ProfileCard } from './tanu/ProfileCard';
import { MatchOverlay } from './tanu/MatchOverlay';
import { ProfileAvatar } from './components/ProfileAvatar';
import { SuggestedReplies } from './tanu/SuggestedReplies';

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
    photo: `${PROFILE_BASE}sophie.jpg`,
  },
  {
    id: 'lina',
    name: 'Lina',
    age: 24,
    distance: '8 公里',
    job: '國小老師',
    bio: '週末喜歡爬山和逛市集，最近在學怎麼手沖咖啡。',
    tags: ['爬山', '咖啡', '甜點'],
    photo: `${PROFILE_BASE}lina.jpg`,
  },
  {
    id: 'emily',
    name: 'Emily',
    age: 25,
    distance: '3 公里',
    job: '行政企劃',
    bio: '剛搬來台北。喜歡咖啡、電影、散步。希望遇到可以好好聊天的人。',
    tags: ['咖啡', '電影', '散步'],
    photo: `${PROFILE_BASE}emily.png`,
  },
];

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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [step]);

  useEffect(() => {
    if (step !== 'ending') return undefined;
    const t = setTimeout(() => setStep('closing'), 1500);
    return () => clearTimeout(t);
  }, [step]);

  function choose(i) {
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

export function DatingBrowse() {
  useSaveScenario02Progress('/scenario02-romance/dating-browse');
  useStageClassName('tanu-stage');
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [index, setIndex] = useState(() => {
    const done = getResolvedDatingCards();
    const i = PEOPLE.findIndex((p) => !done.includes(p.id));
    return i === -1 ? PEOPLE.length - 1 : i;
  });
  const [phase, setPhase] = useState('cards'); // cards | match | chat

  const person = PEOPLE[index];
  const isEmily = person.id === 'emily';

  function handleSwiped(direction) {
    if (direction === 'like') {
      setPhase('match');
    } else if (isEmily) {
      // Passing on Emily just re-shows her card - she's the real storyline,
      // not skippable via decline the way Sophie/Lina are.
      setPhase('cards');
    } else {
      markDatingCardResolved(person.id);
      setIndex((i) => Math.min(i + 1, PEOPLE.length - 1));
      setPhase('cards');
    }
  }

  function startChat() {
    if (isEmily) {
      navigate('/scenario02-romance/dating-chat');
      return;
    }
    setPhase('chat');
  }

  function finishMiniChat() {
    markDatingCardResolved(person.id);
    setIndex((i) => Math.min(i + 1, PEOPLE.length - 1));
    setPhase('cards');
  }

  if (phase === 'chat' && !isEmily) {
    return <MiniMatchChat person={person} arc={MINI_ARCS[person.id]} onDone={finishMiniChat} />;
  }

  return (
    <>
      <div className={`tanu-app${phase === 'match' ? ' tanu-app-blurred' : ''}`}>
        <TanuHeader onProfileClick={() => navigate('/scanner')} />
        <div className="tanu-card-area">
          <ProfileCard ref={cardRef} person={person} onSwiped={handleSwiped} />
        </div>
        <div className="tanu-swipe-actions">
          <button type="button" className="tanu-swipe-btn pass" aria-label="略過" onClick={() => cardRef.current?.swipePass()}>
            <X size={28} />
          </button>
          <button type="button" className="tanu-swipe-btn like" aria-label="喜歡" onClick={() => cardRef.current?.swipeLike()}>
            <Heart size={28} fill="currentColor" />
          </button>
        </div>
        <TanuBottomNav active="cards" />
      </div>
      {phase === 'match' && <MatchOverlay person={person} isEmily={isEmily} onStart={startChat} />}
    </>
  );
}
