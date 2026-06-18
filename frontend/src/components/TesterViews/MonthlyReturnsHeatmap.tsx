import { useMemo } from 'react';

export default function MonthlyReturnsHeatmap({ returns }: { returns: any[] }) {
  const { years, map, maxAbs } = useMemo(() => {
    if (!returns || returns.length === 0) return { years: [], map: {}, maxAbs: 0 };
    
    const map: Record<string, Record<number, number>> = {};
    let maxAbs = 0;
    
    for (const r of returns) {
      const { Year, Month, Value } = r;
      if (!map[Year]) map[Year] = {};
      map[Year][Month] = Value;
      if (Math.abs(Value) > maxAbs) maxAbs = Math.abs(Value);
    }
    
    const years = Object.keys(map).sort((a, b) => Number(b) - Number(a));
    return { years, map, maxAbs };
  }, [returns]);

  if (years.length === 0) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getColor = (val: number | undefined) => {
    if (val === undefined || maxAbs === 0) return 'glass-panel';
    const intensity = Math.min(Math.abs(val) / maxAbs, 1);
    if (val > 0) {
      return `rgba(34, 197, 94, ${0.1 + 0.9 * intensity})`; // Green
    } else {
      return `rgba(239, 68, 68, ${0.1 + 0.9 * intensity})`; // Red
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 mt-4 overflow-auto">
      <h3 className="text-sm text-gray-400 mb-4">Monthly Returns</h3>
      <table className="w-full text-center text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 border border-gray-800 text-gray-400 font-semibold w-16">Year</th>
            {months.map((m) => (
              <th key={m} className="p-2 border border-gray-800 text-gray-400 font-semibold w-24">{m}</th>
            ))}
            <th className="p-2 border border-gray-800 text-gray-400 font-semibold w-24">YTD</th>
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const yearData = map[year];
            let ytd = 0;
            return (
              <tr key={year}>
                <td className="p-2 border border-gray-800 font-bold text-gray-400 glass-panel">{year}</td>
                {months.map((_, i) => {
                  const val = yearData[i + 1];
                  if (val !== undefined) ytd += val;
                  return (
                    <td 
                      key={i} 
                      className="p-2 border border-gray-800 text-gray-100 font-mono"
                      style={{ backgroundColor: getColor(val) }}
                    >
                      {val !== undefined ? val.toFixed(0) : '-'}
                    </td>
                  );
                })}
                <td 
                  className="p-2 border border-gray-800 text-gray-100 font-mono font-bold"
                  style={{ backgroundColor: getColor(ytd) }}
                >
                  {ytd.toFixed(0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
