import { useMemo, useState } from 'react';

function pearson(x: number[], y: number[]) {
  const n = x.length;
  if (n === 0) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (den === 0) return 0;
  return num / den;
}

export default function SensitivityPanel({ passes, columns }: { passes: any[], columns: any[] }) {
  const params = columns.filter(c => c.IsParameter).map(c => c.Name);
  const metrics = columns.filter(c => !c.IsParameter && c.Name !== 'Pass').map(c => c.Name);

  const [targetMetric, setTargetMetric] = useState('Sharpe Ratio');

  const sensitivities = useMemo(() => {
    if (!passes.length) return [];
    const metricVals = passes.map(p => p.Values[targetMetric]);

    return params.map(param => {
      const paramVals = passes.map(p => p.Values[param]);
      const corr = pearson(paramVals, metricVals);
      return { param, corr };
    }).sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));
  }, [passes, params, targetMetric]);

  return (
    <div className="flex flex-col h-full glass-panel rounded-lg border border-gray-800 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-blue-400">Parameter Sensitivity Analysis</h3>
        <div>
          <label className="text-sm text-gray-400 mr-2">Target Metric:</label>
          <select 
            className="bg-gray-800 rounded px-2 py-1 text-sm outline-none text-gray-100" 
            value={targetMetric} 
            onChange={e => setTargetMetric(e.target.value)}
          >
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sensitivities.map(({ param, corr }) => {
          const absCorr = Math.abs(corr);
          let significance = "Weak";
          let color = "text-gray-400";
          if (absCorr > 0.5) { significance = "Strong"; color = "text-green-400"; }
          else if (absCorr > 0.3) { significance = "Moderate"; color = "text-yellow-400"; }
          else if (absCorr < 0.1) { significance = "Negligible"; color = "text-gray-600"; }

          return (
            <div key={param} className="glass-panel p-3 rounded border border-gray-800 flex items-center justify-between">
              <span className="font-mono text-sm text-gray-400">{param}</span>
              <div className="flex items-center space-x-4">
                <div className={`text-sm ${color}`}>{significance} correlation</div>
                <div className="font-bold text-gray-100 w-16 text-right">{corr.toFixed(3)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
