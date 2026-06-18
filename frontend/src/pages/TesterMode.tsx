import { useDropzone } from 'react-dropzone';
import ScoreCard from '../components/ScoreCard';
import BalanceChart from '../components/Charts/BalanceChart';
import NarrativeSummary from '../components/NarrativeSummary';
import SubStrategyBreakdown from '../components/TesterViews/SubStrategyBreakdown';
import MonthlyReturnsHeatmap from '../components/TesterViews/MonthlyReturnsHeatmap';
import TradeTable from '../components/TesterViews/TradeTable';

export default function TesterMode({ report, metrics, loading, openDialog, loadReport }: any) {

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
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }, 
    maxFiles: 1 
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full text-blue-400">Loading and computing metrics...</div>;
  }

  if (!report) {
    return (
      <div 
        {...getRootProps()} 
        onClick={openDialog}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-400">Drag & drop a ReportTester-*.xlsx file here, or <span className="text-blue-400">click to select</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-auto pr-2 pb-12">
      <div className="glass-panel p-4 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-blue-400 mb-2">{report.Settings.Expert} ({report.Settings.Symbol}, {report.Settings.Period})</h2>
        <div className="grid grid-cols-4 gap-4 text-sm text-gray-400">
          <div>Initial Deposit: <span className="text-gray-100">${report.Settings.InitialDeposit}</span></div>
          <div>Leverage: <span className="text-gray-100">{report.Settings.Leverage}</span></div>
          <div>Total Trades: <span className="text-gray-100">{metrics?.N}</span></div>
          <div>Win Rate: <span className="text-gray-100">{((metrics?.WinRate || 0) * 100).toFixed(2)}%</span></div>
        </div>
      </div>

      {metrics && <ScoreCard native={report.NativeStats} computed={metrics} />}
      {metrics && <NarrativeSummary native={report.NativeStats} computed={metrics} />}
      {metrics?.BalanceSeries && <BalanceChart data={metrics.BalanceSeries} />}
      {metrics?.MonthlyReturns && <MonthlyReturnsHeatmap returns={metrics.MonthlyReturns} />}
      {metrics?.SubStrategies && <SubStrategyBreakdown subStrategies={metrics.SubStrategies} />}
      {report?.Deals && <TradeTable deals={report.Deals} />}
    </div>
  );
}
