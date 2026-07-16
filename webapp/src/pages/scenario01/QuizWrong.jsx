import { Button } from '../../components/ui/Button';

export function QuizWrong() {
  return (
    <section className="warning">
      <h2>結果：高風險選擇</h2>
      <p>這正是詐騙集團最希望你做的事。一旦支付保證金，對方通常會再要求稅金、手續費或帳戶解凍金。你可能永遠無法提領本金與獲利。</p>
      <Button to="/scenario01-investment/165">查看 165 提醒</Button>
    </section>
  );
}
