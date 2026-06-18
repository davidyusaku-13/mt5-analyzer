import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function SubStrategyBreakdown({ subStrategies }: { subStrategies: any }) {
  const [sorting, setSorting] = useState<any>([]);

  const data = useMemo(() => {
    if (!subStrategies) return [];
    return Object.values(subStrategies);
  }, [subStrategies]);

  const columns = useMemo(() => [
    { header: 'Sub-Strategy', accessorKey: 'Label' },
    { header: 'Trades', accessorKey: 'TradeCount' },
    { 
      header: 'Win Rate %', 
      accessorKey: 'WinRate',
      cell: (info: any) => (info.getValue() * 100).toFixed(2) + '%'
    },
    { 
      header: 'Avg Profit', 
      accessorKey: 'AvgProfit',
      cell: (info: any) => {
        const val = info.getValue();
        return <span className={val >= 0 ? "text-green-500" : "text-red-500"}>{val.toFixed(2)}</span>;
      }
    },
    { 
      header: 'Total Profit', 
      accessorKey: 'TotalProfit',
      cell: (info: any) => {
        const val = info.getValue();
        return <span className={val >= 0 ? "text-green-500" : "text-red-500"}>{val.toFixed(2)}</span>;
      }
    },
    { 
      header: 'Profit Factor', 
      accessorKey: 'ProfitFactor',
      cell: (info: any) => info.getValue().toFixed(2)
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="glass-panel rounded-lg border border-gray-800 p-4 mt-4 flex flex-col">
      <h3 className="text-sm text-gray-400 mb-4">Sub-Strategy Breakdown</h3>
      <div className="overflow-auto border border-gray-800 rounded">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="glass-panel">
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
    </div>
  );
}
