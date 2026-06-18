import { useMemo, useState } from 'react';

export default function ParameterHeatmap({ passes, columns }: { passes: any[], columns: any[] }) {
  const params = columns.filter(c => c.IsParameter).map(c => c.Name);
  const metrics = columns.filter(c => !c.IsParameter && c.Name !== 'Pass').map(c => c.Name);

  const [xAxis, setXAxis] = useState(params[0] || '');
  const [yAxis, setYAxis] = useState(params[1] || params[0] || '');
  const [colorAxis, setColorAxis] = useState('Profit Factor');

  const { grid, xLabels, yLabels, minColor, maxColor } = useMemo(() => {
    if (!xAxis || !yAxis) return { grid: [], xLabels: [], yLabels: [], minColor: 0, maxColor: 0 };
    
    // Extract unique sorted values for X and Y
    const xVals = Array.from(new Set(passes.map(p => p.Values[xAxis]))).sort((a, b) => a - b);
    const yVals = Array.from(new Set(passes.map(p => p.Values[yAxis]))).sort((a, b) => a - b);

    // Group passes by (x, y)
    const grouped: Record<string, Record<string, number[]>> = {};
    passes.forEach(p => {
      const x = p.Values[xAxis];
      const y = p.Values[yAxis];
      const v = p.Values[colorAxis];
      if (!grouped[y]) grouped[y] = {};
      if (!grouped[y][x]) grouped[y][x] = [];
      grouped[y][x].push(v);
    });

    let minC = Infinity;
    let maxC = -Infinity;

    // Calculate averages
    const matrix = yVals.map(y => {
      return xVals.map(x => {
        const arr = grouped[y]?.[x];
        if (!arr || arr.length === 0) return null;
        const avg = arr.reduce((sum, val) => sum + val, 0) / arr.length;
        if (avg < minC) minC = avg;
        if (avg > maxC) maxC = avg;
        return { avg, count: arr.length };
      });
    });

    return { grid: matrix, xLabels: xVals, yLabels: yVals, minColor: minC === Infinity ? 0 : minC, maxColor: maxC === -Infinity ? 0 : maxC };
  }, [passes, xAxis, yAxis, colorAxis]);

  const getColor = (val: number | null) => {
    if (val === null) return '#1f2937'; // gray-800 for empty
    if (minColor === maxColor) return '#3b82f6';
    const ratio = (val - minColor) / (maxColor - minColor);
    const r = Math.round(239 - (ratio * (239 - 34)));
    const g = Math.round(68 + (ratio * (197 - 68)));
    const b = Math.round(68 + (ratio * (94 - 68)));
    return `rgb(${r},${g},${b})`;
  };

  if (!xAxis || !yAxis) return <div className="text-gray-500">Not enough columns to render heatmap.</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex space-x-4 mb-4 text-sm text-gray-400 shrink-0">
        <div>
          <label className="mr-2 text-gray-400">X-Axis (Param):</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={xAxis} onChange={e => setXAxis(e.target.value)}>
            {params.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="mr-2 text-gray-400">Y-Axis (Param):</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={yAxis} onChange={e => setYAxis(e.target.value)}>
            {params.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="mr-2 text-gray-400">Color (Metric):</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={colorAxis} onChange={e => setColorAxis(e.target.value)}>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 glass-panel rounded-lg border border-gray-800 overflow-auto p-4">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Top-left corner */}
            <div className="w-20 shrink-0"></div>
            {/* X Labels */}
            {xLabels.map(x => (
              <div key={x} className="w-12 text-xs text-gray-500 text-center truncate pr-1" title={String(x)}>
                {x}
              </div>
            ))}
          </div>
          {yLabels.map((y, rowIdx) => (
            <div key={y} className="flex items-center mb-1">
              {/* Y Label */}
              <div className="w-20 shrink-0 text-xs text-gray-500 text-right pr-2 truncate" title={String(y)}>
                {y}
              </div>
              {/* Cells */}
              {grid[rowIdx].map((cell, colIdx) => (
                <div 
                  key={colIdx} 
                  className="w-12 h-6 mr-1 rounded-sm relative group cursor-pointer transition-opacity hover:opacity-80"
                  style={{ backgroundColor: getColor(cell?.avg ?? null) }}
                >
                  {cell !== null && (
                    <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 glass-panel border border-gray-700 text-gray-100 text-xs p-2 rounded z-10 w-max shadow-xl pointer-events-none">
                      <div><span className="text-gray-400">X ({xAxis}):</span> {xLabels[colIdx]}</div>
                      <div><span className="text-gray-400">Y ({yAxis}):</span> {y}</div>
                      <div><span className="text-gray-400">Avg {colorAxis}:</span> {cell.avg.toFixed(2)}</div>
                      <div><span className="text-gray-400">Passes:</span> {cell.count}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
