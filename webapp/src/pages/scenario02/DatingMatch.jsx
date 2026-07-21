import { useEffect, useState } from 'react';
import { TopBar } from '../../shell/TopBar';
import { Button } from '../../components/ui/Button';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

export function DatingMatch() {
  useSaveScenario02Progress('/scenario02-romance/dating-match');
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    if (phase !== 'waiting') return undefined;
    const t = setTimeout(() => setPhase('notified'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <>
      <TopBar brand="SPARK" homeHref="/scanner" homeLabel="繼續掃描" />
      <section className="card match-screen">
        <div className="match-avatars">
          <div className="match-avatar you">你</div>
          <div className="match-avatar emily">E</div>
        </div>
        <div className="match-title">配對成功！</div>
        <p>Emily：嗨～居然真的配對到了😊</p>
        {phase === 'initial' && (
          <ButtonGroup>
            <Button to="/scenario02-romance/dating-chat">傳送訊息</Button>
            <Button variant="secondary" onClick={() => setPhase('waiting')}>晚點再聊</Button>
          </ButtonGroup>
        )}
        {phase === 'waiting' && <p className="mini">（Emily 暫時離開了對話……）</p>}
        {phase === 'notified' && (
          <>
            <div className="toast show">Emily 傳來了一則新訊息</div>
            <ButtonGroup>
              <Button to="/scenario02-romance/dating-chat">查看訊息</Button>
            </ButtonGroup>
          </>
        )}
      </section>
    </>
  );
}
