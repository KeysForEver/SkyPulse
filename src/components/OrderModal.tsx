import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Order, OrderStatus, OrderDetails } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { cn } from './Common';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingOrder?: Order | null;
  clients: Client[];
}

const CUTS_FOLDS_OPTIONS = ['Chaparia', 'Gabarito Instalação', 'Metalon', 'Plotter', 'Dobra', 'Gabarito Produção', 'Router ACM', 'Acrílico', 'Corte Plasma', 'Laser Acrílico', 'Router MDF'];
const WELDS_OPTIONS = ['Branca', 'Eletrodo', 'MIG', 'TIG'];
const ROUGH_FINISH_OPTIONS = ['Desbaste', 'Fino'];
const PAINTING_OPTIONS = ['Automotiva', 'Acetinado / Semi-Brilho', 'Laca', 'Eletrostática', 'Brilhante', 'Poliéster', 'Fosco', 'PU'];
const FINAL_FINISH_OPTIONS = ['ACM', 'Lixamento / Preparação', 'Acrílico', 'MDF', 'Adesivo', 'Pintura', 'Impressão'];
const LIGHTING_OPTIONS = ['Fita LED', 'LED / Soldagem / Fiação', 'RGB', 'Haste', 'Módulo LED', 'Lâmpada Tubular / Fiação', 'Refletor / Fiação'];
const ACCESSORIES_OPTIONS = ['Barra Roscada', 'Cantoneiras', 'Fita VHB', 'Parabolt', 'Pino Fixador', 'Sikadur', 'Bucha', 'Fiação', 'Fonte', 'Parafuso', 'Prolongador', 'Vidros', 'Canaleta de LED', 'Interruptor LD', 'Mão Amiga', 'Perfil Alumínio', 'Sapata Regulável'];
const GLUING_OPTIONS = ['ACM', 'Módulo de LED', 'Acrílico', 'Primmer', 'Cola / Cianocrilato', 'Silicone / Vedação', 'Fita de Borda'];

export const OrderModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingOrder, 
  clients 
}: OrderModalProps) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    status: 'ORDENS DE PRODUÇÃO' as OrderStatus,
    details: {
      entry_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      kanban_description: '',
      impression_3d: { items: [] },
      cuts_folds: { items: [] },
      welds: { items: [] },
      rough_finish: { items: [] },
      painting: { items: [], shipping_date: '' },
      final_finish: { items: [] },
      lighting: { items: [], temperature: '', model: '' },
      accessories: { items: [] },
      gluing: { items: [] }
    } as OrderDetails
  });

  const [customItems, setCustomItems] = useState<{ [key: string]: string[] }>({
    impression_3d: [],
    cuts_folds: [],
    welds: [],
    rough_finish: [],
    painting: [],
    final_finish: [],
    lighting: [],
    accessories: [],
    gluing: []
  });

  useEffect(() => {
    if (editingOrder && isOpen) {
      let details: OrderDetails;
      try {
        details = editingOrder.details ? JSON.parse(editingOrder.details) : null;
      } catch (e) {
        details = null as any;
      }

      const initialDetails: OrderDetails = {
        entry_date: details?.entry_date || new Date().toISOString().split('T')[0],
        delivery_date: details?.delivery_date || '',
        kanban_description: details?.kanban_description || '',
        impression_3d: details?.impression_3d || { items: [] },
        cuts_folds: details?.cuts_folds || { items: [] },
        welds: details?.welds || { items: [] },
        rough_finish: details?.rough_finish || { items: [] },
        painting: details?.painting || { items: [], shipping_date: '' },
        final_finish: details?.final_finish || { items: [] },
        lighting: details?.lighting || { items: [], temperature: '', model: '' },
        accessories: details?.accessories || { items: [] },
        gluing: details?.gluing || { items: [] }
      };

      setFormData({
        title: editingOrder.title,
        description: editingOrder.description || '',
        client_id: editingOrder.client_id?.toString() || '',
        status: editingOrder.status,
        details: initialDetails
      });

      // Identify custom items
      const newCustomItems: { [key: string]: string[] } = {};
      
      const checkCustom = (key: string, options: string[], items: string[]) => {
        const upperOptions = options.map(o => o.toUpperCase());
        newCustomItems[key] = items.filter(item => !upperOptions.includes(item.toUpperCase()));
      };

      checkCustom('impression_3d', ['Impressão 3D'], initialDetails.impression_3d.items);
      checkCustom('cuts_folds', CUTS_FOLDS_OPTIONS, initialDetails.cuts_folds.items);
      checkCustom('welds', WELDS_OPTIONS, initialDetails.welds.items);
      checkCustom('rough_finish', ROUGH_FINISH_OPTIONS, initialDetails.rough_finish.items);
      checkCustom('painting', PAINTING_OPTIONS, initialDetails.painting.items);
      checkCustom('final_finish', FINAL_FINISH_OPTIONS, initialDetails.final_finish.items);
      checkCustom('lighting', LIGHTING_OPTIONS, initialDetails.lighting.items);
      checkCustom('accessories', ACCESSORIES_OPTIONS, initialDetails.accessories.items);
      checkCustom('gluing', GLUING_OPTIONS, initialDetails.gluing.items);

      setCustomItems(newCustomItems);
      setStep(1);
    } else if (!editingOrder && isOpen) {
      setFormData({
        title: '',
        description: '',
        client_id: '',
        status: 'ORDENS DE PRODUÇÃO',
        details: {
          entry_date: new Date().toISOString().split('T')[0],
          delivery_date: '',
          kanban_description: '',
          impression_3d: { items: [] },
          cuts_folds: { items: [] },
          welds: { items: [] },
          rough_finish: { items: [] },
          painting: { items: [], shipping_date: '' },
          final_finish: { items: [] },
          lighting: { items: [], temperature: '', model: '' },
          accessories: { items: [] },
          gluing: { items: [] }
        }
      });
      setCustomItems({
        impression_3d: [],
        cuts_folds: [],
        welds: [],
        rough_finish: [],
        painting: [],
        final_finish: [],
        lighting: [],
        accessories: [],
        gluing: []
      });
      setStep(1);
    }
  }, [editingOrder, isOpen]);

  const handleNext = () => {
    setError(null);
    if (formRef.current && !formRef.current.reportValidity()) {
      return;
    }
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 11));
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = () => {
    // Steps 3-11 are mostly checkboxes, but custom items must have names
    const keys = [
      '', '', 'impression_3d', 'cuts_folds', 'welds', 'rough_finish', 
      'painting', 'final_finish', 'lighting', 'accessories', 'gluing'
    ];
    const key = keys[step - 1];
    if (key) {
      const custom = customItems[key];
      if (custom.some(item => !item.trim())) {
        setError('Por favor, informe o nome de todos os itens personalizados adicionados.');
        return false;
      }
    }
    return true;
  };

  const toggleItem = (key: keyof OrderDetails, item: string) => {
    setError(null);
    const currentItems = (formData.details[key] as any).items as string[];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: {
          ...(prev.details[key] as any),
          items: newItems
        }
      }
    }));
  };

  const syncItems = (key: string, customList: string[]) => {
    // Get current predefined options for this key
    const stepConfigs: { [key: number]: { key: keyof OrderDetails, options: string[] } } = {
      3: { key: 'impression_3d', options: ['Impressão 3D'] },
      4: { key: 'cuts_folds', options: CUTS_FOLDS_OPTIONS },
      5: { key: 'welds', options: WELDS_OPTIONS },
      6: { key: 'rough_finish', options: ROUGH_FINISH_OPTIONS },
      7: { key: 'painting', options: PAINTING_OPTIONS },
      8: { key: 'final_finish', options: FINAL_FINISH_OPTIONS },
      9: { key: 'lighting', options: LIGHTING_OPTIONS },
      10: { key: 'accessories', options: ACCESSORIES_OPTIONS },
      11: { key: 'gluing', options: GLUING_OPTIONS },
    };

    const config = Object.values(stepConfigs).find(c => c.key === key);
    if (!config) return;

    const currentItems = (formData.details[config.key] as any).items as string[];
    const upperOptions = config.options.map(o => o.toUpperCase());
    
    // Keep only predefined items that were already selected
    const predefinedSelected = currentItems.filter(item => 
      config.options.includes(item) || upperOptions.includes(item.toUpperCase())
    );

    // Filter out any predefined items from the custom list to avoid duplicates
    const actualCustom = customList.filter(item => 
      item.trim() !== '' && !upperOptions.includes(item.toUpperCase())
    );

    const newItems = [...new Set([...predefinedSelected, ...actualCustom])];

    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [config.key]: {
          ...(prev.details[config.key] as any),
          items: newItems
        }
      }
    }));
  };

  const addCustomItem = (key: string) => {
    setError(null);
    setCustomItems(prev => ({
      ...prev,
      [key]: [...prev[key], '']
    }));
  };

  const updateCustomItem = (key: string, index: number, value: string) => {
    const newCustom = [...customItems[key]];
    newCustom[index] = value.toUpperCase();
    setCustomItems(prev => ({ ...prev, [key]: newCustom }));
    syncItems(key, newCustom);
  };

  const removeCustomItem = (key: string, index: number) => {
    setError(null);
    const newCustom = customItems[key].filter((_, i) => i !== index);
    setCustomItems(prev => ({ ...prev, [key]: newCustom }));
    syncItems(key, newCustom);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Line 1: TITULO DA ORDEM */}
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
                placeholder="EX: INSTALAÇÃO DE REDE"
              />
            </div>

            {/* Line 2: CLIENTE */}
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
                <option value="">SELECIONE...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Line 3: DATA ENTRADA, DATA ENTREGA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Data de Entrada <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input 
                  type="date" 
                  required
                  value={formData.details.entry_date}
                  onChange={e => setFormData({...formData, details: {...formData.details, entry_date: e.target.value}})}
                  className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Data de Entrega <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input 
                  type="date" 
                  required
                  value={formData.details.delivery_date}
                  onChange={e => setFormData({...formData, details: {...formData.details, delivery_date: e.target.value}})}
                  className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Line 4: DESCRIÇÃO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Descrição <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <textarea 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
                className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-[80px] uppercase"
                placeholder="DETALHES DA ORDEM..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Status Kanban (Selecione 1) <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {KANBAN_COLUMNS.map(col => (
                  <label key={col} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    formData.status === col 
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100" 
                      : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                  )}>
                    <input 
                      type="radio" 
                      name="kanban_status"
                      required
                      className="hidden"
                      checked={formData.status === col}
                      onChange={() => setFormData({...formData, status: col as OrderStatus})}
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      formData.status === col ? "border-white dark:border-zinc-900" : "border-zinc-300"
                    )}>
                      {formData.status === col && <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />}
                    </div>
                    <span className="text-sm font-bold uppercase">{col}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Descrição Opcional</label>
              <textarea 
                value={formData.details.kanban_description}
                onChange={e => setFormData({...formData, details: {...formData.details, kanban_description: e.target.value.toUpperCase()}})}
                className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-[80px] uppercase"
                placeholder="OBSERVAÇÕES DO KANBAN..."
              />
            </div>
          </div>
        );
      default:
        const stepConfigs: { [key: number]: { key: keyof OrderDetails, title: string, options: string[] } } = {
          3: { key: 'impression_3d', title: 'Impressão 3D', options: ['Impressão 3D'] },
          4: { key: 'cuts_folds', title: 'Cortes / Dobra', options: CUTS_FOLDS_OPTIONS },
          5: { key: 'welds', title: 'Soldas', options: WELDS_OPTIONS },
          6: { key: 'rough_finish', title: 'Acabamento Grosso', options: ROUGH_FINISH_OPTIONS },
          7: { key: 'painting', title: 'Pintura', options: PAINTING_OPTIONS },
          8: { key: 'final_finish', title: 'Acabamento Final', options: FINAL_FINISH_OPTIONS },
          9: { key: 'lighting', title: 'Iluminação', options: LIGHTING_OPTIONS },
          10: { key: 'accessories', title: 'Acessórios', options: ACCESSORIES_OPTIONS },
          11: { key: 'gluing', title: 'Colagem', options: GLUING_OPTIONS },
        };
        const config = stepConfigs[step];
        if (!config) return null;

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.options.map(opt => (
                <label key={opt} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                  (formData.details[config.key] as any).items.includes(opt)
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100" 
                    : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                )}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={(formData.details[config.key] as any).items.includes(opt)}
                    onChange={() => toggleItem(config.key, opt)}
                  />
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    (formData.details[config.key] as any).items.includes(opt) ? "border-white dark:border-zinc-900 bg-white dark:bg-zinc-900" : "border-zinc-300"
                  )}>
                    {(formData.details[config.key] as any).items.includes(opt) && <Check size={12} className="text-zinc-900 dark:text-zinc-100" />}
                  </div>
                  <span className="text-xs font-bold uppercase">{opt}</span>
                </label>
              ))}
              
              {customItems[config.key].map((item, idx) => (
                <div key={idx} className="flex gap-2 col-span-full">
                  <div className={cn(
                    "flex-1 flex items-center gap-3 p-3 rounded-xl border bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  )}>
                    <Check size={16} />
                    <input 
                      type="text"
                      value={item}
                      onChange={(e) => updateCustomItem(config.key, idx, e.target.value)}
                      placeholder="NOME DO ITEM PERSONALIZADO"
                      className="flex-1 bg-transparent border-none outline-none text-xs font-bold uppercase placeholder:text-white/50 dark:placeholder:text-black/50"
                      autoFocus={!item}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeCustomItem(config.key, idx)}
                    className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => addCustomItem(config.key)}
              className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase"
            >
              <Plus size={18} />
              Adicionar Item Personalizado
            </button>

            {step === 7 && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Data de Envio</label>
                <input 
                  type="date" 
                  value={formData.details.painting.shipping_date}
                  onChange={e => setFormData({...formData, details: {...formData.details, painting: {...formData.details.painting, shipping_date: e.target.value}}})}
                  className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            {step === 9 && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Temperatura (K)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.details.lighting.temperature}
                    onChange={e => setFormData({...formData, details: {...formData.details, lighting: {...formData.details.lighting, temperature: e.target.value}}})}
                    className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                    placeholder="EX: 3000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Modelo</label>
                  <input 
                    type="text" 
                    value={formData.details.lighting.model}
                    onChange={e => setFormData({...formData, details: {...formData.details, lighting: {...formData.details.lighting, model: e.target.value.toUpperCase()}}})}
                    className="w-full px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
                    placeholder="EX: FITA LED 2835"
                  />
                </div>
              </div>
            )}
          </div>
        );
    }
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
            className="relative w-full md:w-[60%] lg:w-[50%] max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                  {editingOrder ? 'Editar Ordem' : 'Nova Ordem'}
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Etapa {step} de 11</span>
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800">
              <motion.div 
                className="h-full bg-zinc-900 dark:bg-zinc-100"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 11) * 100}%` }}
              />
            </div>

            <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}
              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                        {step === 1 && 'Dados Iniciais'}
                        {step === 2 && 'Kanban'}
                        {step === 3 && 'Impressão 3D'}
                        {step === 4 && 'Cortes / Dobra'}
                        {step === 5 && 'Soldas'}
                        {step === 6 && 'Acabamento Grosso'}
                        {step === 7 && 'Pintura'}
                        {step === 8 && 'Acabamento Final'}
                        {step === 9 && 'Iluminação'}
                        {step === 10 && 'Acessórios'}
                        {step === 11 && 'Colagem'}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase mt-1">
                        {step === 1 && 'Preencha as informações básicas da ordem.'}
                        {step === 2 && 'Selecione o status inicial no quadro Kanban.'}
                        {step > 2 && 'Selecione os itens necessários para esta etapa.'}
                      </p>
                    </div>
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase disabled:opacity-0"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>
                
                <div className="flex gap-3">
                  {step < 11 ? (
                    <button 
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase"
                    >
                      Próximo
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        if (formRef.current && !formRef.current.reportValidity()) {
                          return;
                        }
                        if (validateStep()) {
                          onSubmit(formData);
                          onClose();
                        }
                      }}
                      className="px-10 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase"
                    >
                      Finalizar e Criar Ordem
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
