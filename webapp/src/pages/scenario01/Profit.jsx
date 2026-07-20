import { TopBar } from '../../shell/TopBar';
import { Platform, Stat } from '../../components/ui/Platform';
import { Button } from '../../components/ui/Button';
import { useMoneyCounter } from '../../lib/profitAnimation';

const CANDLES = [
  { i: 0, down: false, line: [24, 108, 24, 95], rect: [18, 99, 12, 7] },
  { i: 1, down: false, line: [58, 96, 58, 84], rect: [52, 87, 12, 7] },
  { i: 2, down: true, line: [92, 102, 92, 87], rect: [86, 91, 12, 9] },
  { i: 3, down: false, line: [126, 81, 126, 66], rect: [120, 71, 12, 9] },
  { i: 4, down: true, line: [160, 86, 160, 71], rect: [154, 75, 12, 9] },
  { i: 5, down: false, line: [194, 63, 194, 49], rect: [188, 53, 12, 9] },
  { i: 6, down: true, line: [228, 69, 228, 54], rect: [222, 58, 12, 9] },
  { i: 7, down: false, line: [262, 47, 262, 32], rect: [256, 37, 12, 9] },
  { i: 8, down: true, line: [296, 51, 296, 36], rect: [290, 40, 12, 9] },
  { i: 9, down: false, line: [330, 30, 330, 14], rect: [324, 19, 12, 9] },
];

const TREND_POINTS = '22,102 58,91 94,98 130,73 166,81 202,55 238,63 274,39 310,45 342,22';

export function Profit() {
  const { money, withdrawVisible } = useMoneyCounter();

  return (
    <>
      <TopBar brand="資產總覽" />
      <Platform variant="profit-platform">
        <p>投入本金：NT$10,000</p>
        <div className="asset-row">
          <div>
            <span className="mini">總資產</span>
            <div className="big-money">{money}</div>
          </div>
          <div className="profit-badge">+56.4%</div>
        </div>
        <div className="fake-chart" aria-label="投資平台帳面獲利 K 線圖">
          <div className="chart-top"><span>AI 智能量化合約</span><strong>LIVE</strong></div>
          <svg className="candlestick-chart" viewBox="0 0 360 130" role="img" aria-label="震盪上漲的 K 線圖">
            <defs>
              <linearGradient id="chartGlow" x1="0" x2="1" y1="1" y2="0">
                <stop offset="0%" stopColor="#39d98a" />
                <stop offset="100%" stopColor="#25d0ff" />
              </linearGradient>
            </defs>
            <g className="grid">
              <path d="M0 25H360M0 54H360M0 83H360M0 112H360" />
              <path d="M45 0V130M115 0V130M185 0V130M255 0V130M325 0V130" />
            </g>
            <polyline className="trend-line" points={TREND_POINTS} />
            <g className="candles">
              {CANDLES.map((c) => (
                <g key={c.i} className={`candle${c.down ? ' candle-down' : ''}`} style={{ '--i': c.i }}>
                  <line x1={c.line[0]} y1={c.line[1]} x2={c.line[2]} y2={c.line[3]} />
                  <rect x={c.rect[0]} y={c.rect[1]} width={c.rect[2]} height={c.rect[3]} />
                </g>
              ))}
            </g>
          </svg>
          <div className="chart-bottom"><span>今日收益</span><strong>+NT$5,640</strong></div>
        </div>
        <Stat label="今日收益" value="+NT$5,640" />
        <Stat label="報酬率" value="+56.4%" />
        <p>系統訊息：恭喜您完成今日操作。</p>
        <Button className="withdraw-btn" to="/scenario01-investment/withdraw-fail" hidden={!withdrawVisible}>
          申請出金
        </Button>
      </Platform>
    </>
  );
}
