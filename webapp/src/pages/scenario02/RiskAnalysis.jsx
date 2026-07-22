import { Card } from '../../components/ui/Card';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const RISKS = [
  { title: '一、快速建立情感依附', body: '對方在短時間內以固定問候、撒嬌、關心作息及親密影片建立戀愛感。' },
  { title: '二、導流私人通訊軟體', body: '由交友平台轉移至私人聊天軟體，讓對話離開原平台的安全與檢舉機制。' },
  { title: '三、以感情建立投資信任', body: '投資不是由公開機構或專業顧問介紹，而是由曖昧對象透過情感關係推薦。' },
  { title: '四、陌生投資網址', body: '對方提供網頁連結，平台缺乏明確公司資訊、金融監管資料及可信客服管道。' },
  { title: '五、假帳面獲利', body: '網頁上的收益、餘額與交易紀錄，都可能由詐騙集團後台任意修改。' },
  { title: '六、要求先付款才能出金', body: '合法平台不應要求使用者先繳交保證金、驗證金、解凍金或稅金，才可以提領自己的資產。' },
  { title: '七、宣稱保證金可退還', body: '「這不是費用」「驗證完成後會一起退還」「只差最後一步」都是用來降低戒心的常見話術。' },
];

export function RiskAnalysis() {
  useSaveScenario02Progress('/scenario02-romance/risk-analysis');
  return (
    <>
      <section className="hero">
        <h1>AI 偵測到多項高風險特徵</h1>
      </section>
      {RISKS.map((r) => (
        <Card key={r.title} className="risk-card">
          <h2 style={{ fontSize: 20 }}>{r.title}</h2>
          <p>{r.body}</p>
        </Card>
      ))}
      <ButtonGroup>
        <Button to="/scenario02-romance/quiz">進行情境測驗</Button>
      </ButtonGroup>
    </>
  );
}
