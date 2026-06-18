import { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';

export default function ScatterPlot({ passes, columns }: { passes: any[], columns: any[] }) {
  const params = columns.filter(c => c.IsParameter).map(c => c.Name);
  const metrics = columns.filter(c => !c.IsParameter && c.Name !== 'Pass').map(c => c.Name);

  const [xAxis, setXAxis] = useState(params[0] || '');
  const [yAxis, setYAxis] = useState('Sharpe Ratio');
  const [zAxis, setZAxis] = useState('Trades');
  const [colorAxis, setColorAxis] = useState('Profit Factor');

  const data = useMemo(() => passes.map((p) => p.Values), [passes]);

  if (!xAxis || !yAxis) return <div className="text-gray-500">Not enough columns to render plot.</div>;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel border border-gray-700 p-3 rounded shadow-lg text-sm">
          <p className="font-bold text-blue-400 mb-1">Pass #{data['Pass']}</p>
          <div className="grid grid-cols-2 gap-x-4 text-gray-400">
            <div><span className="text-gray-500">X ({xAxis}):</span> {data[xAxis]}</div>
            <div><span className="text-gray-500">Y ({yAxis}):</span> {data[yAxis]}</div>
            <div><span className="text-gray-500">Size ({zAxis}):</span> {data[zAxis]}</div>
            <div><span className="text-gray-500">Color ({colorAxis}):</span> {data[colorAxis]}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Compute color scale for the colorAxis
  const minColor = Math.min(...data.map(d => d[colorAxis]));
  const maxColor = Math.max(...data.map(d => d[colorAxis]));
  
  const getColor = (val: number) => {
    if (minColor === maxColor) return '#3b82f6'; // default blue
    // Simple gradient from red (low) to green (high)
    const ratio = (val - minColor) / (maxColor - minColor);
    // r: 239 -> 34, g: 68 -> 197, b: 68 -> 94 (approx tailwind red-500 to green-500)
    const r = Math.round(239 - (ratio * (239 - 34)));
    const g = Math.round(68 + (ratio * (197 - 68)));
    const b = Math.round(68 + (ratio * (94 - 68)));
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex space-x-4 mb-4 text-sm text-gray-400">
        <div>
          <label className="mr-2 text-gray-400">X-Axis:</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={xAxis} onChange={e => setXAxis(e.target.value)}>
            {params.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="mr-2 text-gray-400">Y-Axis:</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={yAxis} onChange={e => setYAxis(e.target.value)}>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="mr-2 text-gray-400">Size:</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={zAxis} onChange={e => setZAxis(e.target.value)}>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="mr-2 text-gray-400">Color:</label>
          <select className="bg-gray-800 rounded px-2 py-1 outline-none" value={colorAxis} onChange={e => setColorAxis(e.target.value)}>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 glass-panel rounded-lg border border-gray-800 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis type="number" dataKey={xAxis} name={xAxis} stroke="#718096" tick={{fill: '#718096'}} domain={['dataMin', 'dataMax']} />
            <YAxis type="number" dataKey={yAxis} name={yAxis} stroke="#718096" tick={{fill: '#718096'}} domain={['dataMin', 'dataMax']} />
            <ZAxis type="number" dataKey={zAxis} name={zAxis} range={[20, 200]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry[colorAxis])} opacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
