import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, OrderStatus } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { cn } from './Common';

interface KanbanProps {
  orders: Order[];
  onUpdateStatus: (id: number, status: OrderStatus) => void;
}

export const Kanban = ({ orders, onUpdateStatus }: KanbanProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm)
    );
  }, [orders, searchTerm]);

  const handleDragStart = (e: React.DragEvent, orderId: number) => {
    e.dataTransfer.setData('orderId', orderId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDraggedOverColumn(col);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const orderId = parseInt(e.dataTransfer.getData('orderId'));
    if (!isNaN(orderId)) {
      onUpdateStatus(orderId, status);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="BUSCAR ORDENS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 uppercase"
          />
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-12rem)]">
        {KANBAN_COLUMNS.map((col) => (
          <div 
            key={col} 
            className="flex-shrink-0 w-72 flex flex-col gap-3"
            onDragOver={(e) => handleDragOver(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col as OrderStatus)}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{col}</h3>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {filteredOrders.filter(o => o.status === col).length}
              </span>
            </div>
            <div className={cn(
              "flex-1 rounded-xl p-2 space-y-3 border transition-colors duration-200",
              draggedOverColumn === col 
                ? "bg-zinc-200/50 dark:bg-zinc-800/50 border-zinc-400 dark:border-zinc-500 border-dashed" 
                : "bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/50"
            )}>
              {filteredOrders.filter(o => o.status === col).map((order) => (
              <motion.div
                layoutId={`order-${order.id}`}
                key={order.id}
                draggable
                onDragStart={(e) => handleDragStart(e, order.id)}
                className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">#{order.id}</span>
                  <button className="text-zinc-300 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300">
                    <MoreVertical size={14} />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 uppercase">{order.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2 uppercase">{order.description || 'SEM DESCRIÇÃO'}</p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-[8px] text-white dark:text-zinc-900 font-bold">
                      {order.client_name?.charAt(0) || 'C'}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase">{order.client_name}</span>
                  </div>
                  <div className="flex gap-1">
                    {KANBAN_COLUMNS.indexOf(col) < KANBAN_COLUMNS.length - 1 && (
                      <button 
                        onClick={() => onUpdateStatus(order.id, KANBAN_COLUMNS[KANBAN_COLUMNS.indexOf(col) + 1])}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};
