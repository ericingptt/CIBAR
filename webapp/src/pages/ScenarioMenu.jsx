import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ButtonGroup } from '../components/ui/ButtonGroup';
import { Button } from '../components/ui/Button';
import { resetScenario02 } from '../lib/scenario02Store';

const SCENARIOS = [
  { route: '/scenario01-investment', label: '假投資' },
  { route: '/scenario02-romance', label: '假交友真詐財' },
  { route: '/scenario03-police', label: '假檢警' },
  { route: '/scenario05-atm', label: '解除分期付款（ATM）' },
  { route: '/scenario04-shopping', label: '假賣家／假物流' },
];

// Second page of the flow (see routes.jsx): language select -> here -> the
// chosen scenario's own pages. Plain click/tap only, no camera or gesture
// step in between.
export function ScenarioMenu() {
  const navigate = useNavigate();

  function enter(route) {
    // Every entry into scenario02 from here is a new run - only scenario02
    // keeps any cross-page progress today, so this is a no-op for the others.
    if (route === '/scenario02-romance') resetScenario02();
    navigate(route);
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">CIB AR ANTI-FRAUD</div>
      </div>
      <section className="hero">
        <p className="mini">刑事警察局 AR 反詐騙教育館</p>
        <h1>請選擇情境</h1>
        <p>選擇其中一個詐騙情境，進入完整的模擬體驗。</p>
        <Card>
          <ButtonGroup className="scenario-grid">
            {SCENARIOS.map((s) => (
              <Button key={s.route} onClick={() => enter(s.route)}>{s.label}</Button>
            ))}
          </ButtonGroup>
        </Card>
      </section>
    </>
  );
}
