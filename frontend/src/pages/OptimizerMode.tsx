import { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import FilterPanel from '../components/OptimizerViews/FilterPanel';
import PassesTable from '../components/OptimizerViews/PassesTable';
import ScatterPlot from '../components/OptimizerViews/ScatterPlot';
import ParameterHeatmap from '../components/OptimizerViews/ParameterHeatmap';
import SensitivityPanel from '../components/OptimizerViews/SensitivityPanel';

export default function OptimizerMode({ report, loading, openDialog, loadReport }: any) {
  const [filters, setFilters] = useState<any>({
    minProfit: 0,
    minSharpe: 0,
    minPF: 1.0,
    maxDD: 100,
    minRecovery: undefined,
    minCustom: undefined,
    minTrades: undefined,
  });

  const [activeView, setActiveView] = useState<'table' | 'scatter' | 'heatmap' | 'sensitivity'>('scatter');

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const filePath = (file as any).path;
    if (filePath) {
      loadReport(filePath);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    noClick: true, 
    accept: { 'application/xml': ['.xml'], 'text/xml': ['.xml'] }, 
    maxFiles: 1 
  });

  const filteredPasses = useMemo(() => {
    if (!report || !report.Passes) return [];
    return report.Passes.filter((p: any) => {
      const vals = p.Values;
      if (filters.minProfit !== undefined && vals['Profit'] < filters.minProfit) return false;
      if (filters.minSharpe !== undefined && vals['Sharpe Ratio'] < filters.minSharpe) return false;
      if (filters.minPF !== undefined && vals['Profit Factor'] < filters.minPF) return false;
      if (filters.maxDD !== undefined && vals['Equity DD %'] > filters.maxDD) return false;
      if (filters.minRecovery !== undefined && vals['Recovery Factor'] < filters.minRecovery) return false;
      if (filters.minCustom !== undefined && vals['Custom'] < filters.minCustom) return false;
      if (filters.minTrades !== undefined && vals['Trades'] < filters.minTrades) return false;
      return true;
    });
  }, [report, filters]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-blue-400">Loading Optimizer Report...</div>;
  }

  if (!report) {
    return (
      <div 
        {...getRootProps()} 
        onClick={openDialog}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-400">Drag & drop a ReportOptimizer-*.xml file here, or <span className="text-blue-400">click to select</span></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="glass-panel p-4 rounded-xl border border-gray-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-blue-400">Optimizer Report</h2>
          <p className="text-sm text-gray-400">Showing {filteredPasses.length} of {report.TotalPasses} passes</p>
        </div>
        <div className="flex space-x-2">
          <button className={`px-3 py-1 text-sm rounded transition-colors ${activeView === 'scatter' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`} onClick={() => setActiveView('scatter')}>Scatter Plot</button>
          <button className={`px-3 py-1 text-sm rounded transition-colors ${activeView === 'heatmap' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`} onClick={() => setActiveView('heatmap')}>Heatmap</button>
          <button className={`px-3 py-1 text-sm rounded transition-colors ${activeView === 'table' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`} onClick={() => setActiveView('table')}>Table</button>
          <button className={`px-3 py-1 text-sm rounded transition-colors ${activeView === 'sensitivity' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`} onClick={() => setActiveView('sensitivity')}>Sensitivity</button>
        </div>
      </div>

      <FilterPanel filters={filters} onApply={setFilters} />

      <div className="flex-1 min-h-0 glass-panel p-4 rounded-xl border border-gray-800 flex flex-col">
        {activeView === 'table' ? (
           <PassesTable passes={filteredPasses} columns={report.Columns} />
        ) : activeView === 'heatmap' ? (
           <ParameterHeatmap passes={filteredPasses} columns={report.Columns} />
        ) : activeView === 'sensitivity' ? (
           <SensitivityPanel passes={filteredPasses} columns={report.Columns} />
        ) : (
           <ScatterPlot passes={filteredPasses} columns={report.Columns} />
        )}
      </div>
    </div>
  );
}
