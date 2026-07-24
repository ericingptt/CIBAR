import { useNavigate } from 'react-router-dom';
import { TopBar } from '../shell/TopBar';
import { Card } from '../components/ui/Card';
import { ButtonGroup } from '../components/ui/ButtonGroup';
import { Button } from '../components/ui/Button';
import { setCameraSourcePreference } from '../camera/cameraSourcePreference';

// Sits between language selection and the scanner. Testing this app doesn't
// always happen with the physical 佐臻/Jorjin AR glasses attached - this
// screen lets whoever's testing explicitly pick which camera source
// getSharedCamera() should use for the rest of this session, instead of
// only ever auto-detecting the native WebView bridge:
//   - 打開原生相機: force a normal getUserMedia() camera (phone/laptop's own
//     camera), for testing without the glasses at all.
//   - 打開佐臻 AR 相機: force waiting for frames pushed in via the native
//     camera-bridge.js receiver (window.onNativeCameraFrame), for testing
//     with the glasses/native shell.
// The choice is remembered for the rest of this browser tab's session (see
// cameraSourcePreference.js) - visiting /scanner again later in the same
// session reuses it without asking again.
export function CameraSourceSelect() {
  const navigate = useNavigate();

  function choose(mode) {
    setCameraSourcePreference(mode);
    navigate('/scanner');
  }

  return (
    <>
      <TopBar brand="AI 視覺線索比對" />
      <Card>
        <h2>選擇鏡頭來源</h2>
        <p>
          測試時如果手邊沒有佐臻 AR 眼鏡，可以先選擇「打開原生相機」，改用手機或電腦本機的鏡頭進行測試；
          如果已經透過佐臻原生 App 開啟這個頁面，請選擇「打開佐臻 AR 相機」。
        </p>
        <ButtonGroup>
          <Button onClick={() => choose('native')}>打開原生相機</Button>
          <Button onClick={() => choose('jorjin')}>打開佐臻 AR 相機</Button>
        </ButtonGroup>
      </Card>
    </>
  );
}
