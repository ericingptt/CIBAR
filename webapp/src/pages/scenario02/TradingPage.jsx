import { useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import { useSaveScenario02Progress, switchToLine } from '../../lib/scenario02Store';

// Section 九 of the story: the strategy detail page reached after "查看策略"
// on platform home and the LINE round trip that follows it. Its own
// "立即啟用" button is the next switch-to-LINE trigger (section 十) - this
// page never shows Emily, only the strategy's own numbers.
export function TradingPage() {
  useSaveScenario02Progress('/scenario02-romance/trading');
  useStageClassName('bition-stage');
  const navigate = useNavigate();

  function activate() {
    switchToLine(navigate, { page: 'strategy', selectedStrategy: 'ai-arbitrage' });
  }

  return (
    <div className="bition-app">
      <header className="bition-sub-header">
        <div className="bition-home-logo small">幣勝客 <span>BITION</span></div>
      </header>
      <div className="bition-home-scroll">
        <div className="bition-card">
          <h2 className="bition-section-title">AI 智能套利策略</h2>
          <p className="mini">系統透過全球市場價差，自動執行套利配置。</p>
          <div className="bition-stat-row"><span>策略市場</span><strong>全球多市場套利</strong></div>
          <div className="bition-stat-row"><span>預估日收益</span><strong>2.8%–6.5%</strong></div>
          <div className="bition-stat-row"><span>策略週期</span><strong>24 小時自動運行</strong></div>
          <div className="bition-stat-row"><span>最低啟用金額</span><strong>10,000 CIBDT</strong></div>
          <div className="bition-stat-row"><span>結算資產</span><strong>CIBDT</strong></div>
          <button type="button" className="bition-btn-primary" onClick={activate}>立即啟用</button>
        </div>
      </div>
    </div>
  );
}
