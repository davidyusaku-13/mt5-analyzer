import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function BalanceChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      let dateStr = "Unknown Date";
      if (data.Date) {
        const d = new Date(data.Date);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleString();
        }
      }
      return (
        <div className="glass-panel border border-gray-700 p-3 rounded shadow-lg text-sm">
          <p className="font-bold text-blue-400 mb-1">Trade #{label}</p>
          <p className="text-gray-400">Date: {dateStr}</p>
          <p className="text-gray-400">Balance: ${data.Balance.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 h-80">
      <h3 className="text-sm text-gray-400 mb-4">Balance Curve</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis dataKey="TradeNum" stroke="#718096" tick={{fill: '#718096'}} />
          <YAxis domain={['auto', 'auto']} stroke="#718096" tick={{fill: '#718096'}} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="Balance" stroke="#3b82f6" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
