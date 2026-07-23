import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ButtonGroup } from '../../components/ui/ButtonGroup';
import { Button } from '../../components/ui/Button';
import { useStageClassName } from '../../shell/StageClassContext';
import { resetScenario02 } from '../../lib/scenario02Store';

function tier(score) {
  if (score >= 5) return { title: '辨識能力優良', body: '你能辨識情感操控、假平台與出金詐騙的主要特徵。' };
  if (score >= 3) return { title: '具備基本辨識能力', body: '你已掌握部分警訊，但面對親密關係與帳面獲利時仍需保持警覺。' };
  return { title: '高風險', body: '你可能容易受到情感信任、假獲利與沉沒成本影響。' };
}

export function QuizResult() {
  useStageClassName('bition-stage');
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showWrong, setShowWrong] = useState(false);
  const score = state?.score ?? 0;
  const answers = state?.answers ?? [];
  const questions = state?.questions ?? [];
  const t = tier(score);
  const wrongOnes = questions.filter((q, i) => answers[i] !== q.correct);

  return (
    <div className="bition-app">
      <div className="bition-home-scroll">
        <Card>
          <h2>你的反詐辨識分數</h2>
          <div className="quiz-score">{score} / {questions.length || 5}</div>
          <p><b>{t.title}</b></p>
          <p>{t.body}</p>

          {wrongOnes.length > 0 && (
            <>
              <Button variant="secondary" onClick={() => setShowWrong((v) => !v)}>
                {showWrong ? '收起錯誤題目' : '查看錯誤題目'}
              </Button>
              {showWrong && wrongOnes.map((q, i) => (
                <div key={i} className="quiz-explain">
                  <p>{q.q}</p>
                  <p>正確答案：{q.options[q.correct]}</p>
                  <p className="mini">{q.explain}</p>
                </div>
              ))}
            </>
          )}

          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => {
                resetScenario02();
                navigate('/scenario02-romance', { replace: true });
              }}
            >
              重新體驗
            </Button>
            <Button to="/scenario02-romance/ending">進入 165 結尾提醒</Button>
          </ButtonGroup>
        </Card>
      </div>
    </div>
  );
}
