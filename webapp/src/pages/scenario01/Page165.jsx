import { Card } from '../../components/ui/Card';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';

export function Page165() {
  return (
    <section className="hero">
      <h1>刑事警察局提醒</h1>
      <p>真正合法投資，不會保證獲利，也不會以出金、解凍、升級會員、繳稅或保證金為由要求你先付款。</p>
      <Card>
        <h2>假投資三大警訊</h2>
        <p>1. 保證獲利、穩賺不賠<br />2. 陌生人要求加入通訊軟體投資群<br />3. 出金前要求先支付保證金、稅金或手續費</p>
      </Card>
      <p>遇到可疑投資訊息，請立即停止付款。撥打 165 反詐騙專線，或至鄰近派出所求證。</p>
      <ButtonGroup>
        <Button to="/scenario-menu">返回情境選單</Button>
        <Button variant="secondary" to="/scenario01-investment">再看一次</Button>
      </ButtonGroup>
    </section>
  );
}
