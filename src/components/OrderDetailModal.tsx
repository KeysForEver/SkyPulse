import React from 'react';
import { X, Edit, Trash2, ClipboardList, User, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';
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
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Detalhes da Ordem</h2>
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
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase">{order.title}</h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{order.description || 'Sem descrição.'}</p>
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
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Criação</p>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline / Progress (Placeholder for future) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Progresso da Ordem</h3>
                <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                    style={{ 
                      width: order.status === 'Revisão' ? '100%' : 
                             order.status === 'Finalização' ? '80%' : 
                             order.status === 'Produção' ? '60%' : 
                             order.status === 'Separação de Material' ? '40%' : '20%' 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                  <span>Início</span>
                  <span>Produção</span>
                  <span>Finalizado</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
