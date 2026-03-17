import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Calendar, 
  Package, 
  User, 
  DollarSign, 
  Hash,
  Download
} from 'lucide-react';
import { cn } from './Common';

interface FinancialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
}

export const FinancialDetailModal = ({
  isOpen,
  onClose,
  entry
}: FinancialDetailModalProps) => {
  if (!entry) return null;

  const renderInvoices = () => {
    if (!entry.invoice_pdf) return (
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 gap-2">
        <FileText size={24} strokeWidth={1} />
        <span className="text-xs font-medium uppercase">Nenhuma nota fiscal anexada</span>
      </div>
    );

    try {
      const invoices = JSON.parse(entry.invoice_pdf);
      if (Array.isArray(invoices) && invoices.length > 0) {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {invoices.map((file: any, idx: number) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm group hover:border-zinc-400 dark:hover:border-zinc-500 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate uppercase">{file.name}</p>
                    <p className="text-[10px] text-zinc-400 uppercase">Documento PDF</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file.data;
                    link.target = '_blank';
                    link.download = file.name;
                    link.click();
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors"
                  title="Baixar Nota Fiscal"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      // Fallback for single file or old format
      return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate uppercase">Nota Fiscal</p>
              <p className="text-[10px] text-zinc-400 uppercase">Documento PDF</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = entry.invoice_pdf!;
              link.target = '_blank';
              link.download = `NF-${entry.doc_number || entry.id}.pdf`;
              link.click();
            }}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors"
            title="Baixar Nota Fiscal"
          >
            <Download size={16} />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Detalhes do Lançamento</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Financeiro / Entrada de Estoque</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <Hash size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Documento Fiscal</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{entry.doc_number || '-'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Data de Emissão</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{entry.issue_date_fmt || '-'}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <Package size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Produto</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 uppercase">{entry.product_name}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <User size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Fornecedor</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 uppercase">{entry.supplier_name || '-'}</p>
                </div>
              </div>

              {/* Values Section */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Quantidade</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{entry.quantity}</p>
                </div>
                <div className="text-center border-x border-zinc-200 dark:border-zinc-700">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Valor Unitário</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{entry.unit_price_fmt}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Valor Total</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{entry.total_value}</p>
                </div>
              </div>

              {/* Invoices Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Anexos / Notas Fiscais</h3>
                </div>
                {renderInvoices()}
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Data do Movimento: {entry.date_fmt}</span>
                  <span>ID: #{entry.id}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
