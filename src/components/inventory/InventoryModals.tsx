import React from 'react';
import { X, Camera, Package, AlertTriangle, Plus, Edit, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Supplier, Order, Movement } from '../../types';
import { Card, cn } from '../Common';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
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
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const ProductModal = ({ 
  isOpen, 
  onClose, 
  editingProduct, 
  formData, 
  setFormData, 
  onSubmit, 
  categories, 
  isAddingCategory, 
  setIsAddingCategory, 
  newCategoryName, 
  setNewCategoryName, 
  onAddCategory,
  productError,
  fileInputRef,
  handleFileChange
}: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Editar Produto' : 'Novo Produto'}>
    <form onSubmit={onSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
      {productError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertTriangle size={18} />
          {productError}
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-400 transition-colors">
            {formData.photo ? (
              <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Camera className="text-zinc-400" size={32} />
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Foto do Produto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Nome do Produto</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            placeholder="Ex: Cabo de Rede Cat6"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Categoria</label>
          <div className="flex gap-2">
            <select 
              required
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Selecione</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button 
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Unidade</label>
          <select 
            required
            value={formData.unit}
            onChange={e => setFormData({...formData, unit: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          >
            <option value="un">Unidade (un)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="m">Metro (m)</option>
            <option value="l">Litro (l)</option>
            <option value="cx">Caixa (cx)</option>
            <option value="par">Par (par)</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {isAddingCategory && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 overflow-hidden"
          >
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nova Categoria</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                placeholder="Nome da categoria"
                autoFocus
              />
              <button 
                type="button"
                onClick={onAddCategory}
                className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Salvar
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-1.5 text-zinc-500 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
        >
          {editingProduct ? 'Atualizar Produto' : 'Criar Produto'}
        </button>
      </div>
    </form>
  </Modal>
);

export const StockInModal = ({
  isOpen,
  onClose,
  stockInData,
  setStockInData,
  onSubmit,
  suppliers,
  isAddingSupplier,
  setIsAddingSupplier,
  newSupplierName,
  setNewSupplierName,
  onAddSupplier,
  locations,
  isAddingLocation,
  setIsAddingLocation,
  newLocationName,
  setNewLocationName,
  onAddLocation,
  products,
  stockInError
}: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Entrada de Estoque">
    <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
      {stockInError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertTriangle size={18} />
          {stockInError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Fornecedor</label>
          <div className="flex gap-2">
            <select 
              required
              value={stockInData.supplier_id}
              onChange={e => setStockInData({...stockInData, supplier_id: e.target.value})}
              className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Selecione</option>
              {suppliers.map((s: Supplier) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button 
              type="button"
              onClick={() => setIsAddingSupplier(true)}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Localização</label>
          <div className="flex gap-2">
            <select 
              required
              value={stockInData.location}
              onChange={e => setStockInData({...stockInData, location: e.target.value})}
              className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Selecione</option>
              {locations.map((l: any) => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <button 
              type="button"
              onClick={() => setIsAddingLocation(true)}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(isAddingSupplier || isAddingLocation) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 overflow-hidden"
          >
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {isAddingSupplier ? 'Novo Fornecedor' : 'Nova Localização'}
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={isAddingSupplier ? newSupplierName : newLocationName}
                onChange={e => isAddingSupplier ? setNewSupplierName(e.target.value) : setNewLocationName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                placeholder={isAddingSupplier ? "Nome do fornecedor" : "Nome da localização"}
                autoFocus
              />
              <button 
                type="button"
                onClick={isAddingSupplier ? onAddSupplier : onAddLocation}
                className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Salvar
              </button>
              <button 
                type="button"
                onClick={() => { setIsAddingSupplier(false); setIsAddingLocation(false); }}
                className="px-4 py-1.5 text-zinc-500 text-xs font-bold rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Documento Fiscal</label>
          <input 
            required
            type="text" 
            value={stockInData.doc_number}
            onChange={e => setStockInData({...stockInData, doc_number: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            placeholder="NF-e, Recibo, etc"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Data de Emissão</label>
          <input 
            required
            type="date" 
            value={stockInData.issue_date}
            onChange={e => setStockInData({...stockInData, issue_date: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Produto</label>
        <select 
          required
          value={stockInData.product_id}
          onChange={e => setStockInData({...stockInData, product_id: e.target.value})}
          className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Selecione um produto</option>
          {products.map((p: Product) => (
            <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Quantidade</label>
          <input 
            required
            type="number" 
            min="0.01"
            step="0.01"
            value={stockInData.quantity || ''}
            onChange={e => setStockInData({...stockInData, quantity: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">V. Unitário (R$)</label>
          <input 
            required
            type="number" 
            min="0.01"
            step="0.01"
            value={stockInData.unit_price || ''}
            onChange={e => setStockInData({...stockInData, unit_price: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Data de Validade</label>
          <input 
            type="date" 
            value={stockInData.expiry_date}
            onChange={e => setStockInData({...stockInData, expiry_date: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-8 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
        >
          Confirmar Entrada
        </button>
      </div>
    </form>
  </Modal>
);

export const StockOutModal = ({
  isOpen,
  onClose,
  stockOutData,
  setStockOutData,
  onSubmit,
  products,
  orders,
  stockOutError,
  setStockOutError
}: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Saída de Estoque">
    <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
      {stockOutError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertTriangle size={18} />
          {stockOutError}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
          Produto {stockOutData.product_id && (
            <span className="ml-2 text-zinc-400">
              (Saldo: {(() => {
                const p = products.find((p: Product) => p.id === parseInt(stockOutData.product_id));
                return (p && p.quantity > 0) ? p.quantity : '-';
              })()})
            </span>
          )}
        </label>
        <select 
          required
          value={stockOutData.product_id}
          onChange={e => {
            setStockOutData({...stockOutData, product_id: e.target.value});
            setStockOutError(null);
          }}
          className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Selecione um produto</option>
          {products.map((p: Product) => (
            <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity > 0 ? p.quantity : '-'})</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Quantidade</label>
        <input 
          required
          type="number" 
          min="0.01"
          step="0.01"
          value={stockOutData.quantity || ''}
          onChange={e => {
            setStockOutData({...stockOutData, quantity: parseFloat(e.target.value) || 0});
            setStockOutError(null);
          }}
          className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Motivo da Saída</label>
        <select 
          required
          value={stockOutData.reason}
          onChange={e => setStockOutData({...stockOutData, reason: e.target.value, destination: ''})}
          className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">Selecione um motivo</option>
          <option value="venda">Venda</option>
          <option value="consumo interno">Consumo Interno</option>
          <option value="devolução">Devolução</option>
          <option value="perda/dano">Perda/Dano</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Destino / Ordem de Produção</label>
        {stockOutData.reason === 'venda' ? (
          <select
            required
            value={stockOutData.destination}
            onChange={e => setStockOutData({...stockOutData, destination: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Selecione uma ordem de produção</option>
            {orders.map((order: Order) => (
              <option key={order.id} value={order.title}>{order.title} (#{order.id})</option>
            ))}
          </select>
        ) : (
          <input 
            required
            type="text" 
            value={stockOutData.destination}
            onChange={e => setStockOutData({...stockOutData, destination: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            placeholder="Ex: Setor de Manutenção"
          />
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-8 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/10"
        >
          Confirmar Saída
        </button>
      </div>
    </form>
  </Modal>
);

export const MinStockModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingProduct
}: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Estoque Mínimo">
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Quantidade Mínima</label>
        <input 
          type="number" 
          min="0"
          step="0.01"
          value={formData.min_quantity === null ? '' : formData.min_quantity}
          onChange={e => setFormData({...formData, min_quantity: e.target.value === '' ? null : parseFloat(e.target.value)})}
          className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
          placeholder="Deixe vazio para remover o limite"
        />
        <p className="text-[10px] text-zinc-400">Você será alertado quando o estoque for igual ou inferior a este valor.</p>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
        >
          Salvar Configuração
        </button>
      </div>
    </form>
  </Modal>
);

export const PdfOptionsModal = ({
  isOpen,
  onClose,
  selectedPdfFields,
  setSelectedPdfFields,
  includeTotalValue,
  setIncludeTotalValue,
  onExport,
  ALL_COLUMNS
}: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Opções de Exportação PDF">
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Colunas para incluir</label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_COLUMNS.map((col: any) => (
            <label key={col.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <input 
                type="checkbox"
                checked={selectedPdfFields.includes(col.id)}
                onChange={() => {
                  if (selectedPdfFields.includes(col.id)) {
                    setSelectedPdfFields(selectedPdfFields.filter((f: string) => f !== col.id));
                  } else {
                    setSelectedPdfFields([...selectedPdfFields, col.id]);
                  }
                }}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{col.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Informações Adicionais</label>
        <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
          <input 
            type="checkbox"
            checked={includeTotalValue}
            onChange={(e) => setIncludeTotalValue(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Incluir Valor Total do Estoque</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={onExport}
          className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
        >
          Gerar PDF
        </button>
      </div>
    </div>
  </Modal>
);

export const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  movements,
  isLoading
}: any) => (
  <AnimatePresence>
    {isOpen && product && (
      <div className="fixed inset-0 z-[200] flex items-center justify-end p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
        >
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{product.name}</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Detalhes do Produto</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {product.photo ? (
                  <img 
                    src={product.photo} 
                    alt={product.name} 
                    className="w-full aspect-square rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 border-dashed flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-2">
                    <Package size={48} strokeWidth={1} />
                    <span className="text-xs font-medium">Sem foto</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Categoria</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Unidade</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.unit}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Estoque Atual</p>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-bold",
                      (product.min_quantity !== null && product.quantity <= product.min_quantity) 
                        ? "text-amber-600 dark:text-amber-400" 
                        : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {product.quantity} {product.unit}
                    </p>
                    {(product.min_quantity !== null && product.quantity <= product.min_quantity) && (
                      <AlertTriangle size={14} className="text-amber-500 dark:text-amber-400" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Estoque Mínimo</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.min_quantity ?? 'Não definido'} {product.min_quantity !== null ? product.unit : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Data de Validade</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('pt-BR') : 'Não informada'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Valor Unitário (Média)</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {(() => {
                      const inMovements = movements.filter((m: Movement) => m.type === 'IN' && m.unit_price > 0);
                      if (inMovements.length === 0) return `R$ ${product.cost_price.toFixed(2)}`;
                      const sum = inMovements.reduce((acc: number, m: Movement) => acc + m.unit_price, 0);
                      const avg = sum / inMovements.length;
                      return `R$ ${avg.toFixed(2)}`;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Valor Total</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {(() => {
                      const inMovements = movements.filter((m: Movement) => m.type === 'IN' && m.unit_price > 0);
                      const avgPrice = inMovements.length > 0 
                        ? inMovements.reduce((acc: number, m: Movement) => acc + m.unit_price, 0) / inMovements.length 
                        : product.cost_price;
                      return `R$ ${(product.quantity * avgPrice).toFixed(2)}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Histórico de Movimentações</h3>
              </div>
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Data</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Qtd</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">V. Unitário</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Origem/Destino</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Doc/Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">Carregando histórico...</td>
                      </tr>
                    ) : movements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">Nenhuma movimentação encontrada.</td>
                      </tr>
                    ) : (
                      movements.map((m: Movement) => (
                        <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(m.date).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              m.type === 'IN' 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                                : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                            )}>
                              {m.type === 'IN' ? <ArrowDownLeft size={8} /> : <ArrowUpRight size={8} />}
                              {m.type === 'IN' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">{m.quantity}</td>
                          <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                            {m.unit_price > 0 ? `R$ ${m.unit_price.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[100px]">
                            {m.type === 'IN' ? (m.supplier_name || m.location || '-') : (m.destination || '-')}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[100px]">
                            {m.type === 'IN' ? (m.doc_number || '-') : (m.reason || '-')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
