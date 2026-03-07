import React from 'react';
import { Search, X } from 'lucide-react';

interface InventoryFiltersProps {
  activeSubTab: 'products' | 'movements';
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  movementTypeFilter: 'ALL' | 'IN' | 'OUT';
  setMovementTypeFilter: (val: 'ALL' | 'IN' | 'OUT') => void;
  movementLocationFilter: string;
  setMovementLocationFilter: (val: string) => void;
  locations: { id: number; name: string }[];
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
}

export const InventoryFilters = ({
  activeSubTab,
  searchTerm,
  setSearchTerm,
  movementTypeFilter,
  setMovementTypeFilter,
  movementLocationFilter,
  setMovementLocationFilter,
  locations,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: InventoryFiltersProps) => {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder={activeSubTab === 'products' ? "BUSCAR PRODUTOS..." : "BUSCAR MOVIMENTAÇÕES..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          className="w-full pl-10 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 uppercase"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {activeSubTab === 'movements' && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={movementTypeFilter}
            onChange={(e) => setMovementTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 uppercase"
          >
            <option value="ALL">TODOS OS TIPOS</option>
            <option value="IN">ENTRADA</option>
            <option value="OUT">SAÍDA</option>
          </select>

          <select
            value={movementLocationFilter}
            onChange={(e) => setMovementLocationFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100 uppercase"
          >
            <option value="ALL">TODAS AS LOCALIZAÇÕES</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.name}>{loc.name.toUpperCase()}</option>
            ))}
          </select>

          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
          />
          <span className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase">até</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
          />
          {(startDate || endDate || movementTypeFilter !== 'ALL' || movementLocationFilter !== 'ALL') && (
            <button 
              onClick={() => { 
                setStartDate(''); 
                setEndDate(''); 
                setMovementTypeFilter('ALL');
                setMovementLocationFilter('ALL');
              }}
              className="p-2 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
              title="Limpar filtros"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
