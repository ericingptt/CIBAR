import { Link } from 'react-router-dom';
import { useStageClassName } from '../../shell/StageClassContext';
import fbadsImage from '../../assets/scenario01-investment/images/fbads.webp';

export function Feed() {
  useStageClassName('feed-stage');
  return (
    <div className="feed-scroll">
      <Link
        className="feed-shot"
        style={{ backgroundImage: `url(${fbadsImage})` }}
        to="/scenario01-investment/video-teacher"
        aria-label="繼續案件，了解更多"
      >
        <span className="feed-cta">了解更多</span>
      </Link>
    </div>
  );
}
