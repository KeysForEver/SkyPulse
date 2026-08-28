import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  FileText, 
  User, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Building2,
  Check,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceEntry as ServiceEntryType, Client, ServiceEntryProduct } from '../types';
import { Card, cn, Input, Select, Button, Modal, ConfirmModal, TextArea } from './Common';
import { maskCurrency, parseCurrency } from '../lib/masks';
import { GenericList } from './GenericList';
import { exportGenericToCSV, exportGenericToPDF } from '../services/exportService';
import { formatCurrency } from '../lib/valueMask';

interface ServiceEntryProps {
  serviceEntries: ServiceEntryType[];
  clients: Client[];
  isAdmin?: boolean;
  currentUserId?: string;
  canSeeValues?: boolean;
  onAdd: (data: any) => Promise<void>;
  onUpdate: (id: string | number, data: any) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingEntry: ServiceEntryType | null;
  setEditingEntry: (entry: ServiceEntryType | null) => void;
}

export const ServiceEntry = ({ 
  serviceEntries, 
  clients, 
  isAdmin = false,
  currentUserId,
  canSeeValues = false,
  onAdd,
  onUpdate,
  onDelete,
  isModalOpen,
  setIsModalOpen,
  editingEntry,
  setEditingEntry
}: ServiceEntryProps) => {
  const filteredEntries = useMemo(() => {
    if (isAdmin) return serviceEntries;
    return serviceEntries.filter(entry => entry.created_by === currentUserId);
  }, [serviceEntries, isAdmin, currentUserId]);

  const handleOpenModal = (entry?: ServiceEntryType) => {
    setEditingEntry(entry || null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingEntry) {
      await onUpdate(editingEntry.id, data);
    } else {
      await onAdd(data);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <GenericList 
        title="ENTRADAS DE SERVIÇO"
        hideTitle={true}
        items={filteredEntries}
        columns={[
          { key: 'id', label: 'ID', mono: true },
          { 
            key: 'date', 
            label: 'DATA',
            render: (val) => {
              try {
                const d = new Date(val);
                if (isNaN(d.getTime())) return '-';
                return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
              } catch (e) {
                return '-';
              }
            }
          },
          { key: 'client_name', label: 'CLIENTE' },
          { key: 'obra', label: 'OBRA' },
          { 
            key: 'products', 
            label: 'PRODUTOS',
            render: (_val, item) => {
              const prods = (item.products && item.products.length > 0)
                ? item.products
                : (item.product_category ? [{ product_category: item.product_category, product_subcategory: item.product_subcategory }] : []);
              if (prods.length === 0) return <span className="text-zinc-400 text-xs italic">-</span>;
              return (
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {prods.map((p: any, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-tight"
                      title={`${p.product_category}${p.product_subcategory ? ` - ${p.product_subcategory}` : ''}`}
                    >
                      {p.product_category}
                      {p.product_subcategory ? ` (${p.product_subcategory})` : ''}
                    </span>
                  ))}
                </div>
              );
            }
          },
          { 
            key: 'local', 
            label: 'LOCAL',
            render: (val) => (
              <span className={cn(
                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                val === 'Sky 1' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              )}>
                {val}
              </span>
            )
          },
          { 
            key: 'valor', 
            label: 'VALOR',
            render: (val) => (
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(val, canSeeValues)}
              </span>
            )
          }
        ]}
        onAdd={() => handleOpenModal()}
        addButtonLabel="NOVA ENTRADA DE SERVIÇO"
        onItemClick={(entry) => handleOpenModal(entry)}
      />

      <ServiceEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        editingEntry={editingEntry}
        clients={clients}
        canSeeValues={canSeeValues}
      />
    </div>
  );
};

interface ServiceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingEntry: ServiceEntryType | null;
  clients: Client[];
  canSeeValues?: boolean;
}

const PRODUCT_OPTIONS: any = {
  'ADESIVO': {
    sub: ['LEITOSO', 'TRANSPARENTE', 'JATEADO', 'CALANDRADO', 'LEITOSO BLACKOUT'],
    variants: ['FOSCO', 'BRILHO', 'JATEADO/LAMINADO'],
    fields: ['altura', 'largura']
  },
  'LONA': {
    sub: ['LEITOSO', 'TRANSPARENTE', 'JATEADO', 'CALANDRADO', 'LEITOSO BLACKOUT'],
    variants: ['FOSCO', 'BRILHO', 'JATEADO/LAMINADO'],
    fields: ['altura', 'largura']
  },
  'PAINEL REVESTIMENTO': {
    sub: ['MDF', 'ACM', 'CHAPA', 'TELA', 'VIDRO'],
    fields: ['altura', 'largura', 'profundidade']
  },
  'LETRA CAIXA': {
    sub: ['AÇO GALVANIZADO', 'AÇO INOX', 'IMPRESSÃO 3D', 'PVC EXPANDIDO', 'ACRÍLICO', 'MDF'],
    fields: ['altura', 'largura', 'profundidade']
  },
  'PLACA': {
    sub: ['ILUMINADA', 'SEM ILUMINAÇÃO'],
    dependentSub: {
      'ILUMINADA': ['CHAPA AÇO', 'ACRÍLICO', 'ACM', 'LONA', 'AÇO C/ ACRÍLICO'],
      'SEM ILUMINAÇÃO': ['CHAPA AÇO', 'ACRÍLICO', 'ACM', 'LONA', 'MDF', 'PS', 'PVC']
    },
    fields: ['altura', 'largura', 'profundidade']
  },
  'MOBILIÁRIO': {
    sub: ['MDF (MARCENARIA)', 'AÇO (SERRALHERIA)', 'MDF/AÇO (MARCENARIA + SERRALHERIA)'],
    fields: ['altura', 'largura', 'profundidade']
  },
  'PAINEL DE LED': {
    fields: ['altura', 'largura']
  }
};

export const ServiceEntryModal = ({ isOpen, onClose, onSubmit, editingEntry, clients, canSeeValues = false }: ServiceEntryModalProps) => {
  const [formData, setFormData] = useState({
    client_id: '',
    obra: '',
    local: 'Sky 1' as 'Sky 1' | 'Sky 2',
    valor: '',
    agencia: ''
  });

  const [products, setProducts] = useState<ServiceEntryProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ServiceEntryProduct>({
    product_category: '',
    product_subcategory: '',
    product_variant: '',
    altura: '',
    largura: '',
    profundidade: '',
    observacao: ''
  });
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(true);
  const [productFeedback, setProductFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (editingEntry) {
      setFormData({
        client_id: editingEntry.client_id.toString(),
        obra: editingEntry.obra,
        local: editingEntry.local,
        valor: maskCurrency(editingEntry.valor.toString().replace('.', ',')),
        agencia: editingEntry.agencia || ''
      });

      if (editingEntry.products && editingEntry.products.length > 0) {
        setProducts(editingEntry.products);
        setIsProductFormOpen(false);
      } else if (editingEntry.product_category) {
        setProducts([{
          id: 'prod-legacy',
          product_category: editingEntry.product_category,
          product_subcategory: editingEntry.product_subcategory || '',
          product_variant: editingEntry.product_variant || '',
          altura: editingEntry.altura || '',
          largura: editingEntry.largura || '',
          profundidade: editingEntry.profundidade || '',
          observacao: editingEntry.observacao || ''
        }]);
        setIsProductFormOpen(false);
      } else {
        setProducts([]);
        setIsProductFormOpen(true);
      }

      setCurrentProduct({
        product_category: '',
        product_subcategory: '',
        product_variant: '',
        altura: '',
        largura: '',
        profundidade: '',
        observacao: ''
      });
      setEditingProductIndex(null);
      setProductFeedback(null);
    } else {
      setFormData({
        client_id: '',
        obra: '',
        local: 'Sky 1',
        valor: '',
        agencia: ''
      });
      setProducts([]);
      setCurrentProduct({
        product_category: '',
        product_subcategory: '',
        product_variant: '',
        altura: '',
        largura: '',
        profundidade: '',
        observacao: ''
      });
      setEditingProductIndex(null);
      setIsProductFormOpen(true);
      setProductFeedback(null);
    }
  }, [editingEntry, isOpen]);

  const resetCurrentProduct = () => {
    setCurrentProduct({
      product_category: '',
      product_subcategory: '',
      product_variant: '',
      altura: '',
      largura: '',
      profundidade: '',
      observacao: ''
    });
    setEditingProductIndex(null);
  };

  const handleAddOrUpdateProduct = () => {
    if (!currentProduct.product_category) return;

    if (editingProductIndex !== null) {
      const updated = [...products];
      updated[editingProductIndex] = { ...currentProduct };
      setProducts(updated);
      setEditingProductIndex(null);
      setProductFeedback('Produto atualizado na lista com sucesso!');
    } else {
      setProducts(prev => [...prev, { ...currentProduct, id: String(Date.now() + Math.random()) }]);
      setProductFeedback('Produto adicionado! Você pode selecionar outro produto abaixo para adicionar mais.');
    }

    resetCurrentProduct();
    setIsProductFormOpen(true);
    setTimeout(() => {
      setProductFeedback(null);
    }, 4000);
  };

  const handleEditProduct = (index: number) => {
    const itemToEdit = products[index];
    if (!itemToEdit) return;
    setCurrentProduct({ ...itemToEdit });
    setEditingProductIndex(index);
    setIsProductFormOpen(true);
    setProductFeedback(null);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
    if (editingProductIndex === index) {
      resetCurrentProduct();
    } else if (editingProductIndex !== null && editingProductIndex > index) {
      setEditingProductIndex(editingProductIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id.toString() === formData.client_id);

    // If user filled in a product but didn't click "Adicionar Produto", auto-add it
    const finalProducts = [...products];
    if (currentProduct.product_category && editingProductIndex === null) {
      finalProducts.push({ ...currentProduct, id: String(Date.now() + Math.random()) });
    } else if (currentProduct.product_category && editingProductIndex !== null) {
      finalProducts[editingProductIndex] = { ...currentProduct };
    }

    const primaryProduct = finalProducts[0] || {};

    const data = {
      ...formData,
      products: finalProducts,
      product_category: primaryProduct.product_category || '',
      product_subcategory: primaryProduct.product_subcategory || '',
      product_variant: primaryProduct.product_variant || '',
      altura: primaryProduct.altura || '',
      largura: primaryProduct.largura || '',
      profundidade: primaryProduct.profundidade || '',
      observacao: primaryProduct.observacao || '',
      client_name: client ? (client.razao_social || client.name) : '',
      valor: parseCurrency(formData.valor)
    };
    await onSubmit(data);
  };

  const selectedCategory = PRODUCT_OPTIONS[currentProduct.product_category];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingEntry ? 'EDITAR ENTRADA DE SERVIÇO' : 'NOVA ENTRADA DE SERVIÇO'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select 
            label="CLIENTE" 
            icon={<User size={18} />}
            required
            value={formData.client_id}
            onChange={(e: any) => setFormData({ ...formData, client_id: e.target.value })}
            options={[
              { value: '', label: 'SELECIONE UM CLIENTE' },
              ...clients.map(c => ({ value: c.id.toString(), label: (c.razao_social || c.name).toUpperCase() }))
            ]}
          />
          <Input 
            label="OBRA" 
            icon={<Briefcase size={18} />}
            required
            value={formData.obra}
            onChange={(e: any) => setFormData({ ...formData, obra: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select 
            label="LOCAL" 
            icon={<MapPin size={18} />}
            required
            value={formData.local}
            onChange={(e: any) => setFormData({ ...formData, local: e.target.value as any })}
            options={[
              { value: 'Sky 1', label: 'SKY 1' },
              { value: 'Sky 2', label: 'SKY 2' }
            ]}
          />
          {canSeeValues && (
            <Input 
              label="VALOR (R$)" 
              icon={<DollarSign size={18} />}
              required
              value={formData.valor}
              onChange={(e: any) => setFormData({ ...formData, valor: maskCurrency(e.target.value) })}
            />
          )}
        </div>

        <Input 
          label="AGÊNCIA" 
          icon={<Building2 size={18} />}
          value={formData.agencia}
          onChange={(e: any) => setFormData({ ...formData, agencia: e.target.value.toUpperCase() })}
        />

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-zinc-500" />
                Lista de Produtos {products.length > 0 && `(${products.length})`}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Adicione quantos produtos forem necessários para este serviço
              </p>
            </div>
            
            {!isProductFormOpen && (
              <button 
                type="button"
                onClick={() => {
                  resetCurrentProduct();
                  setIsProductFormOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold rounded-xl transition-all uppercase shadow-sm active:scale-95"
              >
                <Plus size={14} />
                Adicionar Mais Produtos
              </button>
            )}
          </div>

          {/* Feedback message */}
          {productFeedback && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-medium animate-in fade-in">
              <Check size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{productFeedback}</span>
            </div>
          )}

          {/* List of already added products */}
          {products.length > 0 && (
            <div className="space-y-2">
              {products.map((prod, index) => (
                <div 
                  key={prod.id || index}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-bold">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                        {prod.product_category}
                      </span>
                      {prod.product_subcategory && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">
                          {prod.product_subcategory}
                        </span>
                      )}
                      {prod.product_variant && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase">
                          {prod.product_variant}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
                      {(prod.altura || prod.largura || prod.profundidade) && (
                        <span>
                          Medidas: {[
                            prod.altura ? `Alt: ${prod.altura}m` : null,
                            prod.largura ? `Larg: ${prod.largura}m` : null,
                            prod.profundidade ? `Prof: ${prod.profundidade}m` : null
                          ].filter(Boolean).join(' × ')}
                        </span>
                      )}
                      {prod.observacao && (
                        <span className="italic truncate max-w-sm" title={prod.observacao}>
                          Obs: {prod.observacao}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditProduct(index)}
                      className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Editar produto"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="Remover produto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product configuration box */}
          {isProductFormOpen ? (
            <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/40 dark:bg-zinc-800/20 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                  <Plus size={14} className="text-zinc-500" />
                  {editingProductIndex !== null ? `Editar Produto #${editingProductIndex + 1}` : 'Configurar Produto'}
                </span>
                {products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      resetCurrentProduct();
                      setIsProductFormOpen(false);
                    }}
                    className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 uppercase"
                  >
                    Recolher
                  </button>
                )}
              </div>

              {/* SELECT PRODUTO - Matches CSS selector 1 */}
              <Select 
                label="PRODUTO"
                value={currentProduct.product_category}
                onChange={(e: any) => setCurrentProduct({ 
                  ...currentProduct, 
                  product_category: e.target.value,
                  product_subcategory: '',
                  product_variant: '',
                  altura: '',
                  largura: '',
                  profundidade: ''
                })}
                options={[
                  { value: '', label: 'SELECIONE UM PRODUTO' },
                  ...[
                    { value: 'ADESIVO', label: 'ADESIVO' },
                    { value: 'LONA', label: 'LONA' },
                    { value: 'PAINEL REVESTIMENTO', label: 'PAINEL REVESTIMENTO' },
                    { value: 'LETRA CAIXA', label: 'LETRA CAIXA' },
                    { value: 'PLACA', label: 'PLACA' },
                    { value: 'MOBILIÁRIO', label: 'MOBILIÁRIO' },
                    { value: 'PAINEL DE LED', label: 'PAINEL DE LED' }
                  ].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
                ]}
              />

              {selectedCategory?.sub && (
                <div>
                  <Select 
                    label="OPÇÃO"
                    value={currentProduct.product_subcategory}
                    onChange={(e: any) => setCurrentProduct({ 
                      ...currentProduct, 
                      product_subcategory: e.target.value,
                      product_variant: ''
                    })}
                    options={[
                      { value: '', label: 'SELECIONE UMA OPÇÃO' },
                      ...[...selectedCategory.sub].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((s: string) => ({ value: s, label: s }))
                    ]}
                  />
                </div>
              )}

              {currentProduct.product_category === 'PLACA' && currentProduct.product_subcategory && (
                <div>
                  <Select 
                    label="MATERIAL"
                    value={currentProduct.product_variant}
                    onChange={(e: any) => setCurrentProduct({ ...currentProduct, product_variant: e.target.value })}
                    options={[
                      { value: '', label: 'SELECIONE O MATERIAL' },
                      ...[...(selectedCategory.dependentSub[currentProduct.product_subcategory] || [])].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((s: string) => ({ value: s, label: s }))
                    ]}
                  />
                </div>
              )}

              {(currentProduct.product_category === 'ADESIVO' || currentProduct.product_category === 'LONA') && currentProduct.product_subcategory && (
                <div>
                  <Select 
                    label="ACABAMENTO"
                    value={currentProduct.product_variant}
                    onChange={(e: any) => setCurrentProduct({ ...currentProduct, product_variant: e.target.value })}
                    options={[
                      { value: '', label: 'SELECIONE O ACABAMENTO' },
                      ...[...selectedCategory.variants].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((v: string) => ({ value: v, label: v }))
                    ]}
                  />
                </div>
              )}

              {selectedCategory?.fields && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedCategory.fields.includes('altura') && (
                    <Input 
                      label="ALTURA (m)"
                      placeholder="0,00"
                      value={currentProduct.altura}
                      onChange={(e: any) => setCurrentProduct({ ...currentProduct, altura: e.target.value })}
                    />
                  )}
                  {selectedCategory.fields.includes('largura') && (
                    <Input 
                      label="LARGURA (m)"
                      placeholder="0,00"
                      value={currentProduct.largura}
                      onChange={(e: any) => setCurrentProduct({ ...currentProduct, largura: e.target.value })}
                    />
                  )}
                  {selectedCategory.fields.includes('profundidade') && (
                    <Input 
                      label="PROFUNDIDADE (m)"
                      placeholder="0,00"
                      value={currentProduct.profundidade}
                      onChange={(e: any) => setCurrentProduct({ ...currentProduct, profundidade: e.target.value })}
                    />
                  )}
                </div>
              )}

              <div>
                <TextArea 
                  label="OBSERVAÇÃO DO PRODUTO"
                  value={currentProduct.observacao}
                  onChange={(e: any) => setCurrentProduct({ ...currentProduct, observacao: e.target.value.toUpperCase() })}
                  rows={2}
                  placeholder="Instruções ou observações específicas deste produto..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      resetCurrentProduct();
                      setIsProductFormOpen(false);
                    }}
                    className="px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors uppercase"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddOrUpdateProduct}
                  disabled={!currentProduct.product_category}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold rounded-xl transition-all uppercase active:scale-95 shadow-sm"
                >
                  <Plus size={14} />
                  {editingProductIndex !== null ? 'Salvar Alteração do Produto' : 'Adicionar Produto à Lista'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                resetCurrentProduct();
                setIsProductFormOpen(true);
              }}
              className="w-full py-3.5 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-2xl text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/40 uppercase shadow-sm"
            >
              <Plus size={16} />
              Adicionar Mais Produtos (Abrir Listas)
            </button>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
          >
            CANCELAR
          </button>
          <Button type="submit">
            {editingEntry ? 'ATUALIZAR' : 'SALVAR'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
