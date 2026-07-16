import { TopBar } from '../../shell/TopBar';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';

export function WithdrawFail() {
  return (
    <>
      <TopBar brand="系統通知" homeHref="/" />
      <section className="warning">
        <h2>出金失敗</h2>
        <p>您的帳戶尚未完成高級會員驗證。為保障資金安全，請先支付保證金 NT$30,000。完成後即可立即提領本金與獲利。請於 24 小時內完成，以免帳戶凍結。</p>
        <ButtonGroup>
          <Button variant="danger" to="/scenario01-investment/ai-warning-02">確認支付</Button>
          <Button variant="secondary" to="/scenario01-investment/ai-warning-02">稍後處理</Button>
        </ButtonGroup>
      </section>
    </>
  );
}
