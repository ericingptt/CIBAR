import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGesture } from '../gesture/GestureProvider';
import { Card } from '../components/ui/Card';
import { hasCompletedGestureIntro, setGestureIntroCompleted } from '../lib/gestureIntro';

const STAGES = [
  {
    key: 'scroll',
    icon: '✋↕️',
    title: '第一關：滾動手勢',
    instructions: '把手掌對準鏡頭，向上或向下移動一次（其中一個方向即可）。',
    matches: (gesture) => gesture === 'scrollUp' || gesture === 'scrollDown',
  },
  {
    key: 'select',
    icon: '🤏',
    title: '第二關：選取手勢',
    instructions: '把食指跟拇指捏合在一起，維持一下再放開。',
    matches: (gesture) => gesture === 'select',
  },
];

const GESTURE_LABELS = {
  idle: '（尚未偵測到手勢）',
  scrollUp: '↑ 向上滾動',
  scrollDown: '↓ 向下滾動',
  select: '🤏 選取',
};

// The true entry point of the whole app - see routes.jsx. Purely a
// gesture-literacy gate: prove you can do both gestures once, then move on
// to language select. Deliberately has nothing to do with MindAR or
// scenario navigation. No timer - the user can retry as many times as
// needed, each stage only advances on an actual detected gesture.
export function GestureIntro() {
  const navigate = useNavigate();
  const { gesture, seq, handsDetected, ready, error } = useGesture();
  const [stageIndex, setStageIndex] = useState(0);
  const [justCompletedKey, setJustCompletedKey] = useState(null);
  const stageIndexRef = useRef(0);
  const advancingRef = useRef(false);

  useEffect(() => {
    if (hasCompletedGestureIntro()) {
      navigate('/language', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (advancingRef.current) return;
    const stage = STAGES[stageIndexRef.current];
    if (!stage || !stage.matches(gesture)) return;

    advancingRef.current = true;
    setJustCompletedKey(stage.key);
    const t = setTimeout(() => {
      if (stageIndexRef.current + 1 >= STAGES.length) {
        setGestureIntroCompleted();
        navigate('/language');
        return;
      }
      stageIndexRef.current += 1;
      setStageIndex(stageIndexRef.current);
      setJustCompletedKey(null);
      advancingRef.current = false;
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  const currentStage = STAGES[stageIndex];

  return (
    <>
      <div className="topbar">
        <div className="brand">CIB AR ANTI-FRAUD</div>
      </div>
      <section className="hero">
        <p className="mini">開始之前</p>
        <h1>學會兩個手勢</h1>
        <p>整個體驗會用手勢操作，請先在這裡練習一次滾動手勢跟選取手勢，兩個都成功才會進入下一步。</p>

        <div className="gesture-intro-steps">
          {STAGES.map((stage, index) => {
            const isCurrent = index === stageIndex;
            const isDone = index < stageIndex || (isCurrent && justCompletedKey === stage.key);
            return (
              <Card
                key={stage.key}
                className={`gesture-intro-stage${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}`}
              >
                <div className="gesture-intro-icon" aria-hidden="true">
                  {isCurrent && justCompletedKey === stage.key ? '✅' : stage.icon}
                </div>
                <h2>{stage.title}</h2>
                {isCurrent && justCompletedKey === stage.key ? (
                  <p className="gesture-intro-success">完成！</p>
                ) : (
                  <p>{stage.instructions}</p>
                )}
              </Card>
            );
          })}
        </div>

        <div className="gesture-intro-feedback">
          <p className="mini">
            手勢模型：{error ? `❌ 錯誤：${error}` : ready ? '✅ 已啟動' : '啟動中……'}
          </p>
          <p className="mini">偵測到手：{handsDetected} 隻</p>
          <p className="mini">目前手勢：{GESTURE_LABELS[gesture] || gesture}</p>
          {currentStage && <p className="mini">請完成：{currentStage.title}</p>}
        </div>
      </section>
    </>
  );
}
