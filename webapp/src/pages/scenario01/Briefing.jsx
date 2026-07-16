import { TopBar } from '../../shell/TopBar';
import { Button } from '../../components/ui/Button';
import { ButtonGroup } from '../../components/ui/ButtonGroup';

export function Briefing() {
  return (
    <>
      <TopBar brand="情境一｜假投資詐騙" homeHref="/scanner" homeLabel="繼續掃描" />
      <section className="hero">
        <h1>案件辨識成功</h1>
        <p>疑似假投資詐騙。你將看到社群廣告、投資老師影片、LINE 群組、假平台與出金保證金的完整流程。</p>
        <ButtonGroup>
          <Button to="/scenario01-investment/feed">開始案件</Button>
        </ButtonGroup>
      </section>
    </>
  );
}
