import { useState } from 'react';
import TesterMode from './pages/TesterMode';
import OptimizerMode from './pages/OptimizerMode';
import './index.css';
import { ParseTesterReport, ComputeMetrics, ParseOptimizerReport, OpenTesterFileDialog, OpenOptimizerFileDialog } from '../wailsjs/go/main/App';

function App() {
  const [activeTab, setActiveTab] = useState<'tester' | 'optimizer'>('tester');

  // Tester Mode State
  const [testerReport, setTesterReport] = useState<any>(null);
  const [testerMetrics, setTesterMetrics] = useState<any>(null);
  const [testerLoading, setTesterLoading] = useState(false);

  // Optimizer Mode State
  const [optReport, setOptReport] = useState<any>(null);
  const [optLoading, setOptLoading] = useState(false);

  const loadTesterReport = async (filePath: string) => {
    if (!filePath) return;
    setTesterLoading(true);
    try {
      const parsed = await ParseTesterReport(filePath);
      setTesterReport(parsed);
      const m = await ComputeMetrics(parsed.Deals, parsed.Settings.InitialDeposit);
      setTesterMetrics(m);
    } catch (e) {
      console.error(e);
      alert("Error parsing file: " + e);
    } finally {
      setTesterLoading(false);
    }
  };

  const openTesterDialog = async () => {
    try {
      const filePath = await OpenTesterFileDialog();
      if (filePath) await loadTesterReport(filePath);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOptimizerReport = async (filePath: string) => {
    if (!filePath) return;
    setOptLoading(true);
    try {
      const parsed = await ParseOptimizerReport(filePath);
      setOptReport(parsed);
    } catch (e) {
      console.error(e);
      alert("Error parsing file: " + e);
    } finally {
      setOptLoading(false);
    }
  };

  const openOptimizerDialog = async () => {
    try {
      const filePath = await OpenOptimizerFileDialog();
      if (filePath) await loadOptimizerReport(filePath);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col font-sans bg-transparent">
      <header className="glass-panel border-b border-gray-800 p-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-blue-400">MT5 Analyzer</h1>
        <div className="flex space-x-2 items-center">
          {((activeTab === 'tester' && testerReport) || (activeTab === 'optimizer' && optReport)) && (
            <button 
              onClick={() => activeTab === 'tester' ? (setTesterReport(null), setTesterMetrics(null)) : setOptReport(null)}
              className="px-3 py-1 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors mr-2"
            >
              Clear File
            </button>
          )}
          <div className="flex space-x-2 glass-panel p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'tester' ? 'bg-blue-600 text-gray-100' : 'text-gray-400 hover:text-gray-100'}`}
              onClick={() => setActiveTab('tester')}
            >
              Tester Mode
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'optimizer' ? 'bg-blue-600 text-gray-100' : 'text-gray-400 hover:text-gray-100'}`}
              onClick={() => setActiveTab('optimizer')}
            >
              Optimizer Mode
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        {activeTab === 'tester' ? (
          <TesterMode 
            report={testerReport} 
            metrics={testerMetrics} 
            loading={testerLoading} 
            openDialog={openTesterDialog}
            loadReport={loadTesterReport}
          />
        ) : (
          <OptimizerMode 
            report={optReport} 
            loading={optLoading} 
            openDialog={openOptimizerDialog}
            loadReport={loadOptimizerReport}
          />
        )}
      </main>
    </div>
  );
}

export default App;
