import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';

export function Quiz() {
  const navigate = useNavigate();
  function choose(ans) {
    navigate(ans === 'A' ? '/scenario01-investment/quiz/wrong' : '/scenario01-investment/quiz/right');
  }
  return (
    <Card>
      <h2>小測驗</h2>
      <p>你已經看到帳面獲利，但平台要求先繳保證金才能出金。你會怎麼做？</p>
      <ButtonGroup>
        <Button variant="danger" onClick={() => choose('A')}>A. 先支付保證金，趕快把獲利領出來。</Button>
        <Button onClick={() => choose('B')}>B. 停止付款，查詢 165 或向警方求證。</Button>
      </ButtonGroup>
    </Card>
  );
}
