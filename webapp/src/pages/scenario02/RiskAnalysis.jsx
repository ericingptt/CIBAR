import { Card } from '../../components/ui/Card';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const DISCLOSURES = [
  {
    title: '揭露一：入金後，感情立刻升級',
    body: '玩家第一次入金後，Emily 立刻改稱「老公」，讓金錢行為看起來換來了感情承諾。',
  },
  {
    title: '揭露二：投資被包裝成兩人的未來',
    body: '她把入金說成旅行基金，讓玩家感覺自己不是在投資，而是在替兩人的未來努力。',
  },
  {
    title: '揭露三：未說出口的想像最容易讓人失去判斷',
    body: '民宿、雙人房、兩人獨處及旅行畫面，讓玩家自行補足未明說的親密想像。',
  },
  {
    title: '揭露四：已經投入越多，越難停下來',
    body: '出金失敗後，平台以驗證金為由要求追加付款，Emily 則用已投入的金額與訂房承諾，讓玩家不願停止。',
  },
  {
    title: '揭露五：拒絕付款，被包裝成拒絕感情',
    body: '「我都訂好了」、「我會在那裡等你」及「我們好不容易走到這裡」，都在把拒絕付款轉化成拒絕兩人的關係。',
  },
];

// Same phone-frame width as LINE and 幣勝客 - this page previously rendered
// full desktop width, which broke the immersion right at the story's most
// important educational beat.
export function RiskAnalysis() {
  useSaveScenario02Progress('/scenario02-romance/risk-analysis');
  useStageClassName('bition-stage');
  return (
    <div className="bition-app">
      <div className="bition-home-scroll">
        <section className="hero bition-disclosure-hero">
          <h1>你不是因為貪心才按下去</h1>
          <p>你相信的不是平台。是 Emily 所描繪的見面、旅行、親密關係，以及兩個人的未來。</p>
        </section>
        {DISCLOSURES.map((d) => (
          <Card key={d.title} className="risk-card">
            <h2 style={{ fontSize: 20 }}>{d.title}</h2>
            <p>{d.body}</p>
          </Card>
        ))}
        <Card className="bition-disclosure-final">
          <p>
            任何把感情、見面或共同未來與投資入金綁在一起的關係，都應立即提高警覺。真正想見你的人，不會要求你先用金錢證明感情。
          </p>
        </Card>
        <ButtonGroup>
          <Button to="/scenario02-romance/quiz">進行情境測驗</Button>
        </ButtonGroup>
      </div>
      <div className="bition-165-fixed-bar">
        <span>疑似遭遇詐騙？</span>
        <strong>撥打 165 查證</strong>
      </div>
    </div>
  );
}
