import { Card } from '../../components/ui/Card';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

export function EndingPage() {
  useSaveScenario02Progress('/scenario02-romance/ending');
  return (
    <section className="hero">
      <h1>他讓你心動，不代表他值得你投資。</h1>
      <p>真正的感情，不會要求你用金錢證明信任。</p>
      <Card>
        <h2>遇到以下情況，請立即停止付款</h2>
        <p>
          • 交友對象推薦投資平台<br />
          • 要求以虛擬貨幣或 USDT 入金<br />
          • 帳戶收益異常快速增加<br />
          • 提領時要求保證金、驗證金或解凍金<br />
          • 宣稱支付後會連同獲利一起退還<br />
          • 催促你完成「最後一步」
        </p>
      </Card>
      <p>遇到可疑投資訊息，請立即停止付款。撥打 165 反詐騙專線，或至鄰近派出所求證。</p>
      <ButtonGroup>
        <Button to="/scanner">繼續掃描下一個線索</Button>
        <Button variant="secondary" to="/scenario02-romance">重新體驗</Button>
      </ButtonGroup>
    </section>
  );
}
