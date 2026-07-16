import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../shell/TopBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useVideoProgress } from '../../lib/videoProgress';

export function VideoTeacher() {
  const navigate = useNavigate();
  const { seconds, barWidth, showWarning, continueVideo } = useVideoProgress();

  return (
    <>
      <TopBar brand="30 天掌握飆股趨勢" homeHref="/" />
      <Card>
        <div className="video-box">
          <div>
            <h2>影片 Placeholder</h2>
            <p>陳老師站在白板前，背景有 K 線圖、AI 分析圖、會員獲利截圖。</p>
            <p>播放秒數：<span>{seconds}</span>s</p>
          </div>
        </div>
        <div className="progress">
          <div className="bar" style={{ width: barWidth + '%' }} />
        </div>
        {/* Ported as-is: this button has always been visible from page load in
            the original markup (never actually gated behind the warning-modal
            "continue" action, despite runVideo()'s reveal call implying it
            should be) — preserved here rather than silently changed. */}
        <Button style={{ marginTop: 18 }} onClick={() => navigate('/scenario01-investment/line-teacher')}>
          加入 LINE 了解更多
        </Button>
      </Card>

      <Modal show={showWarning}>
        <div className="warning">
          <h2>⚠ AI 即時辨識</h2>
          <p><b>高風險投資話術</b></p>
          <p>偵測到關鍵字：保證獲利、穩賺不賠。合法投資不得保證收益。若有人承諾穩賺不賠，請立即提高警覺。</p>
          <Button variant="danger" onClick={continueVideo}>繼續觀看</Button>
        </div>
      </Modal>
    </>
  );
}
