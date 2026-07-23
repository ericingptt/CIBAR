import { Link, useNavigate } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';

const START_ROUTE = '/scenario02-romance/dating-browse';

// Always a fresh, no-choices start screen - no "繼續上次進度"/"重新開始"
// card. Whether this run is actually starting from scratch is decided
// upstream (Scanner calls resetScenario02() before navigating here); this
// page's only job is to show the intro and hand off to dating-browse.
export function Briefing() {
  useStageClassName('romance-brief-stage');
  const navigate = useNavigate();

  return (
    <div className="romance-brief-page">
      <div className="romance-brief-topline">
        <span className="romance-brief-eyebrow">情境二｜假交友詐騙</span>
        <Link className="romance-brief-back" to="/scanner">返回掃描</Link>
      </div>
      <div className="romance-brief-body">
        <h1 className="romance-brief-title">心動配對</h1>
        <p className="romance-brief-subtitle">從交友軟體到虛擬貨幣投資陷阱</p>
        <p className="romance-brief-desc">
          你將體驗一段從配對、培養感情，到被引導進入假投資平台的過程。
        </p>
      </div>
      <button type="button" className="romance-brief-cta" onClick={() => navigate(START_ROUTE)}>
        開始體驗
      </button>
    </div>
  );
}
