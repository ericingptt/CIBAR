import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSaveScenario02Progress } from '../../lib/scenario02Store';

const QUESTIONS = [
  {
    q: '交友軟體上的對象在幾天內每天關心你、傳送曖昧自拍，代表什麼？',
    options: ['對方一定是真心喜歡你', '對方可能正在快速建立情感依附', '只要有影片就代表是真人', '交友軟體都很安全'],
    correct: 1,
    explain: '影片與日常關心可以增加真實感，但不能證明對方身分或動機。',
  },
  {
    q: '對方傳來虛擬貨幣平台收益截圖，下列何者正確？',
    options: ['有收益截圖就代表平台合法', '截圖顯示賺錢，就可以放心入金', '截圖可能遭偽造，必須查證平台', '對方是朋友，所以不需要查證'],
    correct: 2,
    explain: '收益截圖可能經過偽造，無法證明平台真實存在，仍須自行查證。',
  },
  {
    q: '假投資網站上的帳戶餘額快速增加，最可能代表什麼？',
    options: ['平台一定使用先進 AI', '畫面數字可能由後台任意控制', '投資已經完成獲利', '虛擬貨幣每天都會上漲'],
    correct: 1,
    explain: '平台網頁上的數字通常由後台系統顯示，並非真實交易結果，可被任意調整。',
  },
  {
    q: '平台要求支付 NT$30,000 資金安全驗證金，並宣稱完成後即可一起提領。你應該怎麼做？',
    options: ['支付保證金，完成最後一步', '先借錢支付，再領回全部資產', '請 Emily 幫忙支付', '停止付款、保留紀錄並查詢 165'],
    correct: 3,
    explain: '合法平台不會要求先付款才能領回自己的資金；停止付款並撥打 165 查證才是正確做法。',
  },
  {
    q: '下列哪一項是整個情境中最重要的警訊？',
    options: ['對方使用私人聊天軟體', '對方喜歡虛擬貨幣', '感情關係被用來影響投資決定', '平台介面使用深色設計'],
    correct: 2,
    explain: '情感操控是整起詐騙得以成功的核心手法，其餘技術細節都只是輔助話術。',
  },
];

export function Quiz() {
  useSaveScenario02Progress('/scenario02-romance/quiz');
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);

  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  function select(i) {
    if (selected !== null) return;
    setSelected(i);
  }

  function next() {
    const nextAnswers = [...answers, selected];
    if (isLast) {
      const score = nextAnswers.filter((a, i) => a === QUESTIONS[i].correct).length;
      navigate('/scenario02-romance/quiz-result', { state: { score, answers: nextAnswers, questions: QUESTIONS } });
      return;
    }
    setAnswers(nextAnswers);
    setSelected(null);
    setIndex((i) => i + 1);
  }

  return (
    <Card>
      <div className="quiz-progress-label">
        <span>第 {index + 1} 題／共 {QUESTIONS.length} 題</span>
      </div>
      <div className="progress">
        <div className="bar" style={{ width: `${((index + (selected !== null ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
      </div>
      <h2 style={{ marginTop: 18 }}>{question.q}</h2>
      <div className="btns">
        {question.options.map((opt, i) => {
          let cls = 'btn secondary quiz-option';
          if (selected !== null) {
            if (i === question.correct) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          }
          return (
            <button key={i} type="button" className={cls} onClick={() => select(i)}>
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="quiz-explain">
          <p>{selected === question.correct ? '✅ 答對了' : '❌ 答錯了'}</p>
          <p>{question.explain}</p>
          <Button onClick={next}>{isLast ? '查看結果' : '下一題'}</Button>
        </div>
      )}
    </Card>
  );
}
