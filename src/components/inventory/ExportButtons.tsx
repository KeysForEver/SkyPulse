import React from 'react';
import { FileText, Download, ArrowUpRight, ArrowDownLeft, Plus, Upload } from 'lucide-react';
import { Product, Movement } from '../../types';

interface ExportButtonsProps {
  activeSubTab: 'products' | 'movements';
  onPdfClick: () => void;
  onCsvClick: () => void;
  onImportCsvClick: () => void;
  onStockOutClick: () => void;
  onStockInClick: () => void;
  onNewProductClick: () => void;
  onExportMovementsPdf: () => void;
  onExportMovementsCsv: () => void;
}

export const ExportButtons = ({
  activeSubTab,
  onPdfClick,
  onCsvClick,
  onImportCsvClick,
  onStockOutClick,
  onStockInClick,
  onNewProductClick,
  onExportMovementsPdf,
  onExportMovementsCsv
}: ExportButtonsProps) => {
  if (activeSubTab === 'products') {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <button 
          onClick={onImportCsvClick}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95"
          title="Importar Produtos via CSV"
        >
          <Upload size={16} />
          IMPORTAR
        </button>
        <button 
          onClick={onPdfClick}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95"
        >
          <FileText size={16} />
          PDF
        </button>
        <button 
          onClick={onCsvClick}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95"
        >
          <Download size={16} />
          CSV
        </button>
        <button 
          onClick={onStockOutClick}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 active:scale-95"
        >
          <ArrowUpRight size={16} />
          SAÍDA
        </button>
        <button 
          onClick={onStockInClick}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 active:scale-95"
        >
          <ArrowDownLeft size={16} />
          ENTRADA
        </button>
        <button 
          onClick={onNewProductClick}
          className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:shadow-none active:scale-95"
        >
          <Plus size={16} />
          NOVO PRODUTO
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      <button 
        onClick={onExportMovementsPdf}
        className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95"
      >
        <FileText size={16} />
        PDF
      </button>
      <button 
        onClick={onExportMovementsCsv}
        className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95"
      >
        <Download size={16} />
        CSV
      </button>
    </div>
  );
};
