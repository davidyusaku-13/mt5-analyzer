import React from 'react';

export default function ScoreCard({ native, computed }: { native: any; computed: any }) {
  const diff = (n: number, c: number) => {
    if (!n || !c) return false;
    return Math.abs(n - c) > 0.05;
  };

  const Card = ({ title, nativeVal, computedVal, threshold, ignoreMismatch }: any) => {
    let color = "text-gray-100";
    if (threshold === 'positive' && computedVal > 0) color = "text-green-500";
    if (threshold === 'positive' && computedVal < 0) color = "text-red-500";
    if (threshold === 'sharpe' && computedVal >= 3) color = "text-green-500";
    if (threshold === 'sharpe' && computedVal < 1) color = "text-red-500";
    if (threshold === 'pf' && computedVal >= 2) color = "text-green-500";
    if (threshold === 'pf' && computedVal < 1.5) color = "text-red-500";

    const mismatch = !ignoreMismatch && diff(nativeVal, computedVal);

    return (
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex flex-col">
        <span className="text-sm text-gray-400 mb-1">{title}</span>
        <div className={`text-2xl font-bold ${color}`}>
          {computedVal !== undefined ? computedVal.toFixed(2) : '-'}
        </div>
        <div className="text-xs text-gray-500 mt-2 flex justify-between">
          <span>MT5: {nativeVal !== undefined ? nativeVal.toFixed(2) : '-'}</span>
          {mismatch && <span className="text-yellow-500" title="Mismatch detected">⚠️</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <Card title="Total Net Profit" nativeVal={native?.TotalNetProfit} computedVal={computed?.ME * computed?.N} threshold="positive" />
      <Card title="Profit Factor" nativeVal={native?.ProfitFactor} computedVal={computed?.ProfitFactor} threshold="pf" />
      <Card title="Expected Payoff" nativeVal={native?.ExpectedPayoff} computedVal={computed?.ME} threshold="positive" />
      <Card title="Sharpe Ratio" nativeVal={native?.SharpeRatio} computedVal={computed?.SharpeRatio} threshold="sharpe" ignoreMismatch={true} />
      <Card title="Z-Score" nativeVal={native?.ZScore} computedVal={computed?.ZScore} />
      <Card title="AHPR" nativeVal={native?.AHPR} computedVal={computed?.AHPR} />
      <Card title="GHPR" nativeVal={native?.GHPR} computedVal={computed?.GHPR} />
      <Card title="LR Correlation" nativeVal={native?.LRCorrelation} computedVal={computed?.LRCorrelation} ignoreMismatch={true} />
    </div>
  );
}
