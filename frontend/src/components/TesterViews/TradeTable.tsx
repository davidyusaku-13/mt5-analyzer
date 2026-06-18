import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function TradeTable({ deals }: { deals: any[] }) {
  const [sorting, setSorting] = useState<any>([]);

  const filteredDeals = useMemo(() => {
    return deals.filter(d => d.Direction === 'out' || d.Direction === 'in/out' || d.Direction === 'out/in');
  }, [deals]);

  const columns = useMemo(() => [
    {
      header: 'Time',
      accessorFn: (row: any) => new Date(row.OpenTime).toLocaleString(),
      id: 'Time'
    },
    { header: 'Ticket', accessorKey: 'Ticket' },
    { header: 'Symbol', accessorKey: 'Symbol' },
    { header: 'Type', accessorKey: 'Type' },
    { header: 'Lots', accessorKey: 'Lots' },
    { header: 'Price', accessorKey: 'OpenPrice' },
    { header: 'Commission', accessorKey: 'Commission' },
    { header: 'Swap', accessorKey: 'Swap' },
    { 
      header: 'Profit', 
      accessorKey: 'Profit',
      cell: (info: any) => {
        const val = info.getValue();
        return <span className={val >= 0 ? "text-green-500" : "text-red-500"}>{val.toFixed(2)}</span>;
      }
    },
    { 
      header: 'Balance', 
      accessorKey: 'Balance',
      cell: (info: any) => info.getValue().toFixed(2)
    },
    { header: 'Comment', accessorKey: 'Comment' },
  ], []);

  const table = useReactTable({
    data: filteredDeals,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 50 }
    }
  });

  if (!deals || deals.length === 0) return null;

  const handleExport = async () => {
    if (!deals || deals.length === 0) return;
    const headers = ['Time', 'Ticket', 'Symbol', 'Type', 'Direction', 'Lots', 'OpenPrice', 'Commission', 'Swap', 'Profit', 'Balance', 'Comment'];
    const csvContent = [
      headers.join(','),
      ...deals.map(d => [
        new Date(d.OpenTime).toLocaleString().replace(/,/g, ''),
        d.Ticket, d.Symbol, d.Type, d.Direction, d.Lots, d.OpenPrice, d.Commission, d.Swap, d.Profit, d.Balance, `"${d.Comment || ''}"`
      ].join(','))
    ].join('\n');
    
    try {
      // @ts-ignore
      await window.go.main.App.SaveCSVFile(csvContent, "tester_trades.csv");
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="glass-panel rounded-lg border border-gray-800 p-4 mt-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm text-gray-400">Trade History</h3>
        <button 
          onClick={handleExport}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-600/90 text-gray-100 rounded text-xs transition-colors"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-auto flex-1 min-h-0 border border-gray-800 rounded">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="glass-panel sticky top-0 z-10 shadow">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="p-2 border-b border-gray-800 cursor-pointer hover:bg-gray-800 select-none font-semibold text-xs uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-gray-800 hover:glass-panel">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-400 shrink-0">
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors" 
            onClick={() => table.setPageIndex(0)} 
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button 
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button 
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button 
            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors" 
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
        <span>
          Page <strong className="text-gray-100">{table.getState().pagination.pageIndex + 1}</strong> of <strong className="text-gray-100">{table.getPageCount()}</strong>
        </span>
      </div>
    </div>
  );
}
