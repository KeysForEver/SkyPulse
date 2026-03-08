import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Card, cn } from './Common';
import { useDebounce } from '../hooks/useDebounce';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

interface GenericListProps {
  title: string;
  items: any[];
  columns: Column[];
  showAddButton?: boolean;
  showActions?: boolean;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: number) => void;
}

export const GenericList = ({ 
  title, 
  items, 
  columns, 
  showAddButton = true, 
  showActions = true,
  onAdd,
  onEdit,
  onDelete
}: GenericListProps) => {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(inputValue, 300);

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      columns.some(col => 
        item[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [items, searchTerm, columns]);

  return (
    <Card className="p-0">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap uppercase">{title}</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={14} />
            <input 
              type="text" 
              placeholder="BUSCAR..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            />
          </div>
        </div>
        {showAddButton && onAdd && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors uppercase"
          >
            <Plus size={16} />
            Novo
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{col.label}</th>
              ))}
              {showActions && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                {columns.map(col => (
                  <td key={col.key} className={cn("px-6 py-4 text-sm", col.mono ? "font-mono text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100")}>
                    {item[col.key]}
                  </td>
                ))}
                {showActions && (
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors"
                          title="Editar"
                        >
                          <Plus className="rotate-45" size={14} /> {/* Using Plus rotated as a simple edit icon or just use lucide Edit if available */}
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-6 py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm italic uppercase">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
