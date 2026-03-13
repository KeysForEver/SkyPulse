import React from 'react';
import { X, Edit, Trash2, ClipboardList, User, Calendar, CheckCircle2, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderDetails } from '../types';
import { cn } from './Common';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onEdit: (order: Order) => void;
  onDelete: (id: number) => void;
}

export const OrderDetailModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onEdit,
  onDelete
}: OrderDetailModalProps) => {
  if (!order) return null;

  let details: OrderDetails | null = null;
  try {
    details = order.details ? JSON.parse(order.details) : null;
  } catch (e) {
    console.error("Error parsing order details", e);
  }

  const renderSection = (title: string, items: string[], extra?: React.ReactNode) => {
    if (items.length === 0 && !extra) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-4 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
          <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{title}</h4>
        </div>
        <div className="grid grid-cols-1 gap-1.5 ml-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">
                {item}
              </span>
            </div>
          ))}
          {items.length === 0 && <span className="text-[10px] text-zinc-400 italic ml-8">NENHUM ITEM SELECIONADO</span>}
          {extra && <div className="mt-2 ml-8">{extra}</div>}
        </div>
      </div>
    );
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
            className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Checklist de Produção</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">#{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEdit(order)}
                  className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors shadow-sm"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta ordem?')) {
                      onDelete(order.id);
                      onClose();
                    }
                  }}
                  className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg transition-colors shadow-sm"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 ml-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Title & Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase leading-tight">{order.title}</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 uppercase">{order.description || 'Sem descrição.'}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Status Atual</span>
                  <span className="px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full text-xs font-bold uppercase">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Informações do Cliente
                  </h3>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">{order.client_name || 'NÃO INFORMADO'}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">ID do Cliente: {order.client_id || '-'}</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Datas e Prazos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Entrada</p>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {details?.entry_date ? new Date(details.entry_date).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Criação</p>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details - Production Checklist */}
              {details && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> Processo de Produção
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                      Itens Selecionados
                    </span>
                  </div>
                  
                  {details.kanban_description && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Observações Kanban</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 uppercase leading-relaxed">{details.kanban_description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 p-6 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm">
                    {renderSection('1. Impressão 3D', details.impression_3d.items)}
                    {renderSection('2. Cortes / Dobra', details.cuts_folds.items)}
                    {renderSection('3. Soldas', details.welds.items)}
                    {renderSection('4. Acabamento Grosso', details.rough_finish.items)}
                    {renderSection('5. Pintura', details.painting.items, details.painting.shipping_date && (
                      <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Data de Envio</p>
                        <p className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">{new Date(details.painting.shipping_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    ))}
                    {renderSection('6. Acabamento Final', details.final_finish.items)}
                    {renderSection('7. Iluminação', details.lighting.items, (details.lighting.temperature || details.lighting.model) && (
                      <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg grid grid-cols-2 gap-2">
                        {details.lighting.temperature && <div><p className="text-[9px] font-bold text-zinc-400 uppercase">Temp</p><p className="text-[10px] font-bold">{details.lighting.temperature}K</p></div>}
                        {details.lighting.model && <div><p className="text-[9px] font-bold text-zinc-400 uppercase">Modelo</p><p className="text-[10px] font-bold uppercase truncate">{details.lighting.model}</p></div>}
                      </div>
                    ))}
                    {renderSection('8. Acessórios', details.accessories.items)}
                    {renderSection('9. Colagem', details.gluing.items)}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status da Produção</h3>
                <div className="relative h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-zinc-900 dark:bg-zinc-100"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: order.status === 'CONCLUIDO' ? '100%' :
                             order.status === 'REVISÃO' ? '85%' : 
                             order.status === 'FINALIZAÇÃO' ? '70%' : 
                             order.status === 'PRODUÇÃO' ? '55%' : 
                             order.status === 'SEPARAÇÃO DE MATERIAL' ? '40%' : '20%' 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                  <span>Início</span>
                  <span>Produção</span>
                  <span>Concluído</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
