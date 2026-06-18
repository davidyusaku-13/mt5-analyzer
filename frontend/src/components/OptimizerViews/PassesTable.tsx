import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState
} from '@tanstack/react-table';

export default function PassesTable({ passes, columns }: { passes: any[], columns: any[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = useMemo(() => passes.map((p) => p.Values), [passes]);

  const tableCols = useMemo(() => {
    return columns.filter(c => !c.IsParameter).map((c) => ({
      header: c.Name,
      accessorKey: c.Name,
      cell: (info: any) => {
        const val = info.getValue();
        if (typeof val === 'number') {
          // Keep passes as integers, format others
          if (c.Name === 'Pass' || c.Name === 'Trades') return val;
          return val.toFixed(2);
        }
        return val;
      }
    }));
  }, [columns]);

  const table = useReactTable({
    data: tableData,
    columns: tableCols,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleExport = async () => {
    if (!passes || passes.length === 0) return;
    const exportColumns = columns.filter(c => !c.IsParameter);
    const headers = exportColumns.map(c => c.Name);
    
    const csvContent = [
      headers.join(','),
      ...passes.map(p => 
        exportColumns.map(c => p.Values[c.Name]).join(',')
      )
    ].join('\n');
    
    try {
      // @ts-ignore
      await window.go.main.App.SaveCSVFile(csvContent, "optimizer_passes.csv");
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm text-gray-400">Optimization Passes ({passes.length})</h3>
        <button 
          onClick={handleExport}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-600/90 text-gray-100 rounded text-xs transition-colors"
        >
          Export CSV
        </button>
      </div>
      <div className="flex-1 overflow-auto border border-gray-800 rounded-lg glass-panel">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 glass-panel text-gray-400 z-10 border-b border-gray-800 shadow-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-4 py-2 font-medium cursor-pointer hover:text-gray-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-800/30 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 text-gray-400">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-4 mt-auto">
        <span className="text-sm text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
