import { TopBar } from '../shell/TopBar';
import { Button } from '../components/ui/Button';
import { ButtonGroup } from '../components/ui/ButtonGroup';

// Shared placeholder for scenario02-05, which today are identical
// "reserved route" pages differing only in <title> (not shown in-app).
export function ScenarioStub() {
  return (
    <>
      <TopBar brand="情境入口" homeHref="/scanner" homeLabel="繼續掃描" />
      <section className="hero">
        <h1>此情境已保留入口</h1>
        <p>目前第一版先完成情境一完整流程。這裡先保留路由，之後可接上對應詐騙劇情。</p>
        <ButtonGroup>
          <Button to="/scanner">回到掃描</Button>
        </ButtonGroup>
      </section>
    </>
  );
}
