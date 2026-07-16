import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function QuizRight() {
  return (
    <Card>
      <h2>結果：正確選擇</h2>
      <p>你成功停在關鍵一步。出金前要求付款，是假投資詐騙常見警訊。遇到疑似詐騙，請保留對話與交易紀錄，立即撥打 165 或就近向警方求證。</p>
      <Button to="/scenario01-investment/165">查看 165 提醒</Button>
    </Card>
  );
}
