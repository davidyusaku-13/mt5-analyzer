import { useState, useEffect } from 'react';

export default function FilterPanel({ filters, onApply }: { filters: any, onApply: (f: any) => void }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: string, value: string) => {
    setLocalFilters({ ...localFilters, [key]: value === '' ? undefined : parseFloat(value) });
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 shrink-0">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Profit ($)</label>
          <input 
            type="number" 
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.minProfit !== undefined ? localFilters.minProfit : ''}
            onChange={(e) => handleChange('minProfit', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Sharpe</label>
          <input 
            type="number" 
            step="0.1"
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.minSharpe !== undefined ? localFilters.minSharpe : ''}
            onChange={(e) => handleChange('minSharpe', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Profit Factor</label>
          <input 
            type="number" 
            step="0.1"
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.minPF !== undefined ? localFilters.minPF : ''}
            onChange={(e) => handleChange('minPF', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Max Equity DD %</label>
          <input 
            type="number" 
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.maxDD !== undefined ? localFilters.maxDD : ''}
            onChange={(e) => handleChange('maxDD', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Recovery</label>
          <input 
            type="number" 
            step="0.1"
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.minRecovery !== undefined ? localFilters.minRecovery : ''}
            onChange={(e) => handleChange('minRecovery', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Custom</label>
          <input 
            type="number" 
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.minCustom !== undefined ? localFilters.minCustom : ''}
            onChange={(e) => handleChange('minCustom', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min Trades</label>
          <input 
            type="number" 
            className="glass-panel border border-gray-700 rounded px-2 py-1 text-sm w-24 text-gray-100 focus:border-blue-500 outline-none"
            value={localFilters.minTrades !== undefined ? localFilters.minTrades : ''}
            onChange={(e) => handleChange('minTrades', e.target.value)}
          />
        </div>
        <button 
          onClick={() => onApply(localFilters)}
          className="bg-blue-600 hover:bg-blue-600/90 text-gray-100 px-4 py-1 rounded text-sm transition-colors ml-auto h-8"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}
