import { Button } from '../../components/ui/Button';

export function AiWarning02() {
  return (
    <section className="warning">
      <h2>⚠ 165 案例比對成功</h2>
      <p>偵測到高風險行為：出金前要求付款。</p>
      <p>常見話術：保證金、稅金、手續費、驗證金、解凍金。</p>
      <p>真正合法投資不會要求先付款才能領回自己的資金。建議：停止付款，查詢 165 或向警方求證。</p>
      <Button variant="danger" to="/scenario01-investment/quiz">我知道了</Button>
    </section>
  );
}
