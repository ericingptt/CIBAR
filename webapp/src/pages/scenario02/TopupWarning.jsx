import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';
import { RedWarning } from './components/RedWarning';

// Section 二十三: second mandatory stop-point, reached after the withdrawal
// failure and the long guilt-trip LINE conversation that follows it,
// right before the "verification top-up" payment page.
export function TopupWarning() {
  useSaveScenario02Progress('/scenario02-romance/topup-warning');
  useStageClassName('bition-stage');
  const navigate = useNavigate();

  return (
    <div className="bition-app">
      <div className="bition-home-scroll">
        <RedWarning
          title="高度疑似假投資詐騙"
          body="正規投資平台不會要求您為了提領自己的資金，再繳交「安全驗證金」、「風控保證金」、「稅金」或其他追加款項。對方正在使用民宿、旅行、見面及親密關係的承諾，讓您害怕失去兩人的未來，進而忽略明顯的詐騙警訊。"
          emphasis="先付款才能提領，極可能是假投資詐騙。"
          primaryLabel="停止付款"
          secondaryLabel="我知道有風險，繼續體驗"
          correctText="你選擇停止付款。要求先付款才能提領，是假投資詐騙的明顯特徵。"
          onContinue={() => navigate('/scenario02-romance/guarantee')}
        />
      </div>
    </div>
  );
}
