import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Button } from '../../components/ui/Button';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { loadScenario02Progress, resetScenario02Progress } from '../../lib/scenario02Store';

const START_ROUTE = '/scenario02-romance/dating-browse';

export function Briefing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const saved = loadScenario02Progress();
    if (saved?.route && saved.route !== '/scenario02-romance') setProgress(saved);
  }, []);

  function restart() {
    resetScenario02Progress();
    navigate(START_ROUTE);
  }

  return (
    <>
      <TopBar brand="情境二｜假交友詐騙" homeHref="/scanner" homeLabel="繼續掃描" />
      <section className="hero">
        <h1>心動配對</h1>
        <p className="mini">假交友 × 虛擬貨幣投資詐騙</p>
        <p>
          一個普通的配對，會把你帶向什麼地方？你將經歷交友軟體配對、私訊培養感情，最後被引導進入假虛擬貨幣平台，並在申請出金時被要求支付一筆「保證金」。
        </p>
        {progress ? (
          <ButtonGroup>
            <Button onClick={() => navigate(progress.route)}>繼續上次進度</Button>
            <Button variant="secondary" onClick={restart}>重新開始</Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            <Button to={START_ROUTE}>開始體驗</Button>
          </ButtonGroup>
        )}
      </section>
    </>
  );
}
