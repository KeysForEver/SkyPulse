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
  const [formData, setFormData] = useState<Partial<Client>>({
    tipo_cliente: 'PF',
    name: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    razao_social: '',
    cnpj: '',
    nome_fantasia: '',
    ie: '',
    im: '',
    contato_responsavel: '',
    endereco: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    telefone1: '',
    telefone2: '',
    email: ''
  });

  useEffect(() => {
    if (editingClient) {
      setFormData(editingClient);
    } else {
      setFormData({
        tipo_cliente: 'PF',
        name: '',
        cpf: '',
        rg: '',
        data_nascimento: '',
        razao_social: '',
        cnpj: '',
        nome_fantasia: '',
        ie: '',
        im: '',
        contato_responsavel: '',
        endereco: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        telefone1: '',
        telefone2: '',
        email: ''
      });
    }
  }, [editingClient, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (formData.tipo_cliente === 'PF') {
      if (!formData.name || !formData.cpf) return;
    } else {
      if (!formData.razao_social || !formData.cnpj) return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingClient ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex gap-6 mb-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="tipo_cliente" 
              value="PF" 
              checked={formData.tipo_cliente === 'PF'} 
              onChange={() => setFormData({ ...formData, tipo_cliente: 'PF' })}
              className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300"
            />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase">PESSOA FÍSICA</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="tipo_cliente" 
              value="PJ" 
              checked={formData.tipo_cliente === 'PJ'} 
              onChange={() => setFormData({ ...formData, tipo_cliente: 'PJ' })}
              className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300"
            />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase">PESSOA JURÍDICA</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.tipo_cliente === 'PF' ? (
            <>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">NOME COMPLETO <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CPF <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.cpf} 
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">RG</label>
                <input 
                  type="text" 
                  value={formData.rg} 
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">DATA NASCIMENTO</label>
                <input 
                  type="date" 
                  value={formData.data_nascimento} 
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">RAZÃO SOCIAL <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.razao_social} 
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CNPJ <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.cnpj} 
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">NOME FANTASIA</label>
                <input 
                  type="text" 
                  value={formData.nome_fantasia} 
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">RG/IE</label>
                <input 
                  type="text" 
                  value={formData.ie} 
                  onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">IM</label>
                <input 
                  type="text" 
                  value={formData.im} 
                  onChange={(e) => setFormData({ ...formData, im: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CONTATO / RESPONSÁVEL</label>
                <input 
                  type="text" 
                  value={formData.contato_responsavel} 
                  onChange={(e) => setFormData({ ...formData, contato_responsavel: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">ENDEREÇO</label>
            <input 
              type="text" 
              value={formData.endereco} 
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">COMPLEMENTO</label>
            <input 
              type="text" 
              value={formData.complemento} 
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">BAIRRO</label>
            <input 
              type="text" 
              value={formData.bairro} 
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CEP</label>
            <input 
              type="text" 
              value={formData.cep} 
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CIDADE</label>
            <input 
              type="text" 
              value={formData.cidade} 
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">TELEFONE 1</label>
            <input 
              type="text" 
              value={formData.telefone1} 
              onChange={(e) => setFormData({ ...formData, telefone1: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">TELEFONE 2</label>
            <input 
              type="text" 
              value={formData.telefone2} 
              onChange={(e) => setFormData({ ...formData, telefone2: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">EMAIL</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase">
            CANCELAR
          </button>
          <button type="submit" className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase">
            {editingClient ? 'ATUALIZAR' : 'SALVAR'}
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
  const [formData, setFormData] = useState<Partial<Supplier>>({
    tipo: 'PF',
    name: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    razao_social: '',
    cnpj: '',
    nome_fantasia: '',
    ie: '',
    im: '',
    contato_responsavel: '',
    endereco: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidade: '',
    telefone1: '',
    telefone2: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    if (editingSupplier) {
      setFormData(editingSupplier);
    } else {
      setFormData({
        tipo: 'PF',
        name: '',
        cpf: '',
        rg: '',
        data_nascimento: '',
        razao_social: '',
        cnpj: '',
        nome_fantasia: '',
        ie: '',
        im: '',
        contato_responsavel: '',
        endereco: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        telefone1: '',
        telefone2: '',
        email: '',
        website: ''
      });
    }
  }, [editingSupplier, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tipo === 'PF') {
      if (!formData.name || !formData.cpf) return;
    } else {
      if (!formData.razao_social || !formData.cnpj) return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingSupplier ? 'EDITAR FORNECEDOR' : 'NOVO FORNECEDOR'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex gap-6 mb-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="tipo" 
              value="PF" 
              checked={formData.tipo === 'PF'} 
              onChange={() => setFormData({ ...formData, tipo: 'PF' })}
              className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300"
            />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase">PESSOA FÍSICA</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="radio" 
              name="tipo" 
              value="PJ" 
              checked={formData.tipo === 'PJ'} 
              onChange={() => setFormData({ ...formData, tipo: 'PJ' })}
              className="w-4 h-4 text-zinc-900 focus:ring-zinc-900 border-zinc-300"
            />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors uppercase">PESSOA JURÍDICA</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.tipo === 'PF' ? (
            <>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">NOME COMPLETO <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CPF <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.cpf} 
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">RG</label>
                <input 
                  type="text" 
                  value={formData.rg} 
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">DATA NASCIMENTO</label>
                <input 
                  type="date" 
                  value={formData.data_nascimento} 
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">RAZÃO SOCIAL <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.razao_social} 
                  onChange={(e) => setFormData({ ...formData, razao_social: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CNPJ <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.cnpj} 
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">NOME FANTASIA</label>
                <input 
                  type="text" 
                  value={formData.nome_fantasia} 
                  onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">RG/IE</label>
                <input 
                  type="text" 
                  value={formData.ie} 
                  onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">IM</label>
                <input 
                  type="text" 
                  value={formData.im} 
                  onChange={(e) => setFormData({ ...formData, im: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CONTATO / RESPONSÁVEL</label>
                <input 
                  type="text" 
                  value={formData.contato_responsavel} 
                  onChange={(e) => setFormData({ ...formData, contato_responsavel: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">ENDEREÇO</label>
            <input 
              type="text" 
              value={formData.endereco} 
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">COMPLEMENTO</label>
            <input 
              type="text" 
              value={formData.complemento} 
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">BAIRRO</label>
            <input 
              type="text" 
              value={formData.bairro} 
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CEP</label>
            <input 
              type="text" 
              value={formData.cep} 
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">CIDADE</label>
            <input 
              type="text" 
              value={formData.cidade} 
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">TELEFONE 1</label>
            <input 
              type="text" 
              value={formData.telefone1} 
              onChange={(e) => setFormData({ ...formData, telefone1: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">TELEFONE 2</label>
            <input 
              type="text" 
              value={formData.telefone2} 
              onChange={(e) => setFormData({ ...formData, telefone2: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">EMAIL</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">WEBSITE</label>
            <input 
              type="text" 
              value={formData.website} 
              onChange={(e) => setFormData({ ...formData, website: e.target.value.toLowerCase() })}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white dark:bg-black"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase">
            CANCELAR
          </button>
          <button type="submit" className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase">
            {editingSupplier ? 'ATUALIZAR' : 'SALVAR'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

