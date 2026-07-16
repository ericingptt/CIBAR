import { useEffect, useState } from 'react';

// Port of the old js/app.js moneyAnim()/initProfitAnimation(): steps a
// balance counter through a hardcoded sequence, then reveals the withdraw
// button 1600ms after the last step.
const MONEY_STEPS = [10000, 12580, 13920, 15640];

export function useMoneyCounter() {
  const [stepIndex, setStepIndex] = useState(0);
  const [withdrawVisible, setWithdrawVisible] = useState(false);

  useEffect(() => {
    if (stepIndex >= MONEY_STEPS.length - 1) {
      const t = setTimeout(() => setWithdrawVisible(true), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), 1200);
    return () => clearTimeout(t);
  }, [stepIndex]);

  return { money: 'NT$' + MONEY_STEPS[stepIndex].toLocaleString(), withdrawVisible };
}
