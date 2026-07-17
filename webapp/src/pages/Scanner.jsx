import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../shell/TopBar';
import { Card } from '../components/ui/Card';
import { ButtonGroup } from '../components/ui/ButtonGroup';
import { Button } from '../components/ui/Button';
import { TRACKER_TARGETS } from '../scanner/trackerConfig';
import { useTracker } from '../scanner/useTracker';

const SIMULATE_SCAN_MAP = {
  investment: { route: '/scenario01-investment', label: '假投資詐騙' },
  romance: { route: '/scenario02-romance', label: '假交友詐騙' },
  police: { route: '/scenario03-police', label: '假檢警詐騙' },
  shopping: { route: '/scenario04-shopping', label: '假買家騙賣家' },
  atm: { route: '/scenario05-atm', label: '解除分期 / ATM' },
};

export function Scanner() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('AI 視覺線索比對中……');
  const { status, targetStates, stats, cameraLabel, targetsLoaded } = useTracker(containerRef);

  function simulateScan(scenario) {
    const target = SIMULATE_SCAN_MAP[scenario];
    setCameraStatus('線索辨識成功：' + target.label);
    setTimeout(() => navigate(target.route), 1200);
  }

  return (
    <>
      <TopBar brand="AI 視覺線索比對" />
      <Card className="scanner-card">
        <h2>請尋找現場可疑線索</h2>
        <p>可掃描桌上真實物件，也可掃描背板上的對應圖案。第一版先用測試按鈕模擬辨識結果。</p>
        <div className="scanner">
          <div ref={containerRef} className="tracker-container" />
          <div className="hint">{cameraStatus}</div>
        </div>
        <div className="tracker-stats">
          <p className="mini">{status}</p>
          <p className="mini">
            攝影機來源：{cameraLabel || '尚未取得'}
          </p>
          <p className="mini">
            Target 檔案：
            {targetsLoaded === null && '讀取中……'}
            {targetsLoaded === 'error' && '❌ 讀取失敗（見上方錯誤訊息）'}
            {typeof targetsLoaded === 'number' && `✅ 已載入 ${targetsLoaded} 個 target`}
          </p>
        </div>
        <div className="tracker-stats">
          {TRACKER_TARGETS.map((t) => {
            const state = targetStates[t.index] || 'lost';
            const label = state === 'found' ? '✅ 找到／追蹤中' : '⬜ 尚未偵測到';
            return (
              <p className="mini" key={t.index}>
                Target #{t.index}（{t.name}）：{label}
              </p>
            );
          })}
        </div>
        <div className="tracker-stats">
          <p className="mini">
            模型：MindAR (image tracking)　FPS：{stats.fps.toFixed(1)}　畫面間隔：{stats.frameMs.toFixed(1)} ms
          </p>
        </div>
        <ButtonGroup className="scenario-grid">
          <Button onClick={() => simulateScan('investment')}>模擬掃到：假投資</Button>
          <Button onClick={() => simulateScan('romance')}>模擬掃到：假交友</Button>
          <Button onClick={() => simulateScan('police')}>模擬掃到：假檢警</Button>
          <Button onClick={() => simulateScan('shopping')}>模擬掃到：假買家</Button>
          <Button onClick={() => simulateScan('atm')}>模擬掃到：解除分期</Button>
        </ButtonGroup>
      </Card>
    </>
  );
}
