import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Order, OrderStatus } from '../types';
import { KANBAN_COLUMNS } from '../constants';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingOrder?: Order | null;
  clients: Client[];
}

export const OrderModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingOrder, 
  clients 
}: OrderModalProps) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    client_id: '',
    status: 'Ordens de Produção' as OrderStatus
  });

  React.useEffect(() => {
    if (editingOrder) {
      setFormData({
        title: editingOrder.title,
        description: editingOrder.description || '',
        client_id: editingOrder.client_id?.toString() || '',
        status: editingOrder.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        client_id: '',
        status: 'Ordens de Produção'
      });
    }
  }, [editingOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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
            className="relative w-full md:w-[50%] max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                {editingOrder ? 'Editar Ordem de Produção' : 'Nova Ordem de Produção'}
              </h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Título da Ordem <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
                    placeholder="EX: INSTALAÇÃO DE REDE - CLIENTE X"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Descrição</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-[100px] uppercase"
                    placeholder="DETALHES DA ORDEM..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Cliente <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <select 
                      required
                      value={formData.client_id}
                      onChange={e => setFormData({...formData, client_id: e.target.value})}
                      className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
                    >
                      <option value="">SELECIONE UM CLIENTE</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status Inicial</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})}
                      className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
                    >
                      {KANBAN_COLUMNS.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase"
                >
                  {editingOrder ? 'Salvar Alterações' : 'Criar Ordem'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
