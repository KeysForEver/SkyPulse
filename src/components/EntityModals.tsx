import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Modal } from './inventory/InventoryModals';
import { Client, Supplier, Asset } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingClient?: Client | null;
}

export const ClientModal = ({ isOpen, onClose, onSubmit, editingClient }: ClientModalProps) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone
      });
    } else {
      setFormData({ name: '', email: '', phone: '' });
    }
    setError(null);
  }, [editingClient, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Nome <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => { setFormData({...formData, name: e.target.value.toUpperCase()}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="NOME DO CLIENTE"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            E-mail <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={e => { setFormData({...formData, email: e.target.value.toLowerCase()}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="exemplo@email.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Telefone <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="text" 
            required
            value={formData.phone}
            onChange={e => { setFormData({...formData, phone: e.target.value}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase">
            Cancelar
          </button>
          <button type="submit" className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase">
            {editingClient ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingSupplier?: Supplier | null;
}

export const SupplierModal = ({ isOpen, onClose, onSubmit, editingSupplier }: SupplierModalProps) => {
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name,
        contact: editingSupplier.contact
      });
    } else {
      setFormData({ name: '', contact: '' });
    }
    setError(null);
  }, [editingSupplier, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Nome <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => { setFormData({...formData, name: e.target.value.toUpperCase()}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="NOME DO FORNECEDOR"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Contato <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="text" 
            required
            value={formData.contact}
            onChange={e => { setFormData({...formData, contact: e.target.value.toUpperCase()}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="TELEFONE OU E-MAIL"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase">
            Cancelar
          </button>
          <button type="submit" className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase">
            {editingSupplier ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingAsset?: Asset | null;
}

export const AssetModal = ({ isOpen, onClose, onSubmit, editingAsset }: AssetModalProps) => {
  const [formData, setFormData] = useState({ name: '', code: '', status: 'ATIVO' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAsset) {
      setFormData({
        name: editingAsset.name,
        code: editingAsset.code,
        status: editingAsset.status
      });
    } else {
      setFormData({ name: '', code: '', status: 'ATIVO' });
    }
    setError(null);
  }, [editingAsset, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingAsset ? 'Editar Patrimônio' : 'Novo Patrimônio'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Nome <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => { setFormData({...formData, name: e.target.value.toUpperCase()}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="NOME DO PATRIMÔNIO"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Código <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            type="text" 
            required
            value={formData.code}
            onChange={e => { setFormData({...formData, code: e.target.value.toUpperCase()}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-mono"
            placeholder="EX: PAT-001"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Status <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <select 
            required
            value={formData.status}
            onChange={e => { setFormData({...formData, status: e.target.value}); }}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
          >
            <option value="ATIVO">ATIVO</option>
            <option value="MANUTENÇÃO">MANUTENÇÃO</option>
            <option value="INATIVO">INATIVO</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase">
            Cancelar
          </button>
          <button type="submit" className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase">
            {editingAsset ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
