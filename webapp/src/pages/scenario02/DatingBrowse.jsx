import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Button } from '../../components/ui/Button';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const CARDS = [
  { id: 'sophie', name: 'Sophie，27', meta: '台北市，距離 4 公里', bio: '喜歡旅行、咖啡和看電影。' },
  { id: 'lina', name: 'Lina，24', meta: '新北市，距離 8 公里', bio: '週末喜歡爬山和逛市集。' },
  {
    id: 'emily',
    name: 'Emily，25',
    meta: '台北市，距離 3 公里',
    bio: '剛搬來台北不久。喜歡咖啡、電影和隨便走走。希望遇到一個可以好好聊天的人。',
  },
];

export function DatingBrowse() {
  useSaveScenario02Progress('/scenario02-romance/dating-browse');
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('browse');

  const card = CARDS[index];
  const isEmily = card.id === 'emily';

  function like() {
    if (isEmily) {
      navigate('/scenario02-romance/dating-match');
      return;
    }
    setIndex((i) => i + 1);
  }

  function skip() {
    if (isEmily) {
      setPhase('liked-prompt');
      return;
    }
    setIndex((i) => i + 1);
  }

  if (phase === 'liked-prompt') {
    return (
      <>
        <TopBar brand="SPARK" homeHref="/scanner" homeLabel="繼續掃描" />
        <section className="card">
          <h2>Emily 剛剛也對你按了喜歡</h2>
          <p>要再看看嗎？</p>
          <ButtonGroup>
            <Button onClick={() => navigate('/scenario02-romance/dating-match')}>查看她的資料</Button>
            <Button variant="secondary" onClick={() => setPhase('final-note')}>繼續略過</Button>
          </ButtonGroup>
        </section>
      </>
    );
  }

  if (phase === 'final-note') {
    return (
      <>
        <TopBar brand="SPARK" homeHref="/scanner" homeLabel="繼續掃描" />
        <section className="card">
          <p>本情境將模擬一段常見的網路交友歷程。</p>
          <ButtonGroup>
            <Button onClick={() => navigate('/scenario02-romance/dating-match')}>進入模擬對話</Button>
            <Button variant="secondary" to="/scanner">返回首頁</Button>
          </ButtonGroup>
        </section>
      </>
    );
  }

  return (
    <>
      <TopBar brand="SPARK" homeHref="/scanner" homeLabel="繼續掃描" />
      <div className="dating-card">
        <div className="dating-avatar">{card.name[0]}</div>
        <div className="dating-name">{card.name}</div>
        <div className="dating-meta">{card.meta}</div>
        <p className="dating-bio">{card.bio}</p>
        <div className="dating-actions">
          <button className="btn skip" type="button" aria-label="略過" onClick={skip}>✕ 略過</button>
          <button className="btn like" type="button" aria-label="喜歡" onClick={like}>💛 喜歡</button>
        </div>
      </div>
    </>
  );
}
