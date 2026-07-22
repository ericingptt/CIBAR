import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';
import { SparkLogo } from './spark/SparkLogo';
import { ChatIcon, BellIcon, SettingsIcon } from './spark/icons';
import { MatchOverlay } from './spark/MatchOverlay';

const CARDS = [
  {
    id: 'sophie',
    name: 'Sophie',
    age: 27,
    distance: '4 km away',
    job: '平面設計師',
    bio: '喜歡旅行、咖啡和看電影。假日常常到處走走拍照。',
    tags: ['Coffee', 'Travel', 'Photo'],
    gradient: 'linear-gradient(155deg,#FFB199,#FF8D6B)',
  },
  {
    id: 'lina',
    name: 'Lina',
    age: 24,
    distance: '8 km away',
    job: '國小老師',
    bio: '週末喜歡爬山和逛市集，最近在學怎麼手沖咖啡。',
    tags: ['Hiking', 'Market', 'Coffee'],
    gradient: 'linear-gradient(155deg,#FFD3A5,#FFA36C)',
  },
  {
    id: 'emily',
    name: 'Emily',
    age: 25,
    distance: '3 km away',
    job: '行政企劃',
    bio: '剛搬來台北。喜歡咖啡、電影、散步。希望遇到可以好好聊天的人。',
    tags: ['Coffee', 'Movie', 'Walking'],
    gradient: 'linear-gradient(155deg,#FF9AA6,#FF5A76)',
  },
];

export function DatingBrowse() {
  useSaveScenario02Progress('/scenario02-romance/dating-browse');
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('browse');
  const [swipe, setSwipe] = useState('idle');

  const card = CARDS[index];
  const isEmily = card?.id === 'emily';

  function swipeThen(direction, after) {
    if (swipe !== 'idle') return;
    setSwipe(direction);
    setTimeout(() => {
      setSwipe('idle');
      after();
    }, 460);
  }

  function like() {
    swipeThen('like', () => {
      if (isEmily) {
        setPhase('match');
        return;
      }
      setIndex((i) => i + 1);
    });
  }

  function skip() {
    swipeThen('pass', () => {
      if (isEmily) {
        setPhase('liked-prompt');
        return;
      }
      setIndex((i) => i + 1);
    });
  }

  if (phase === 'liked-prompt') {
    return (
      <div className="spark-app">
        <section className="spark-interstitial">
          <h2>Emily 剛剛也對你按了喜歡</h2>
          <p>要再看看嗎？</p>
          <ButtonGroup>
            <Button onClick={() => setPhase('match')}>查看她的資料</Button>
            <Button variant="secondary" onClick={() => setPhase('final-note')}>繼續略過</Button>
          </ButtonGroup>
        </section>
      </div>
    );
  }

  if (phase === 'final-note') {
    return (
      <div className="spark-app">
        <section className="spark-interstitial">
          <p>本情境將模擬一段常見的網路交友歷程。</p>
          <ButtonGroup>
            <Button onClick={() => setPhase('match')}>進入模擬對話</Button>
            <Button variant="secondary" to="/scanner">返回首頁</Button>
          </ButtonGroup>
        </section>
      </div>
    );
  }

  return (
    <>
    <div className={`spark-app${phase === 'match' ? ' spark-app-blurred' : ''}`}>
      <header className="spark-header">
        <SparkLogo size={30} />
        <div className="spark-header-title">Discover</div>
        <div className="spark-header-icons">
          <button type="button" aria-label="聊天"><ChatIcon /></button>
          <button type="button" aria-label="通知"><BellIcon /></button>
          <button type="button" aria-label="設定" onClick={() => navigate('/scanner')}><SettingsIcon /></button>
        </div>
      </header>

      <div className="spark-stack">
        <article className={`spark-swipe-card${swipe !== 'idle' ? ` swipe-${swipe}` : ''}`}>
          <div className="spark-photo" style={{ background: card.gradient }}>
            <span className="spark-photo-initial">{card.name[0]}</span>
            <div className="spark-photo-shade" />
            <div className="spark-photo-info">
              <span className="spark-photo-name">
                {card.name} <span className="spark-photo-age">{card.age}</span>
              </span>
              <span className="spark-photo-distance">{card.distance}</span>
            </div>
            {swipe === 'like' && <div className="spark-stamp like">LIKE</div>}
            {swipe === 'pass' && <div className="spark-stamp pass">PASS</div>}
          </div>
          <div className="spark-info-card">
            <div className="spark-job">{card.job}</div>
            <p className="spark-bio">{card.bio}</p>
            <div className="spark-tags">
              {card.tags.map((tag) => (
                <span className="spark-tag" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="spark-actions">
        <button className="spark-action pass" type="button" aria-label="略過" onClick={skip}>✕</button>
        <button className="spark-action like" type="button" aria-label="喜歡" onClick={like}>♥</button>
      </div>
    </div>
    {phase === 'match' && (
      <MatchOverlay onDone={() => navigate('/scenario02-romance/dating-chat')} />
    )}
    </>
  );
}
