import React, { useState, useEffect } from 'react';
import { X, Camera, Calendar, DollarSign, Percent, Tag, FileText, Hash, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import { Asset } from '../../types';
import { Modal, Input, Select, Button, cn } from '../Common';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  asset?: Asset | null;
  categories: { id: number, name: string }[];
}

export const AssetModal = ({ isOpen, onClose, onSave, asset, categories }: AssetModalProps) => {
  const [formData, setFormData] = useState({
    description: '',
    asset_number: '',
    category: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_value: '',
    depreciation_type: 'MENSAL',
    depreciation_percentage: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (asset) {
      setFormData({
        description: asset.description,
        asset_number: asset.asset_number || '',
        category: asset.category || '',
        purchase_date: asset.purchase_date || new Date().toISOString().split('T')[0],
        purchase_value: asset.purchase_value.toString(),
        depreciation_type: asset.depreciation_type || 'MENSAL',
        depreciation_percentage: asset.depreciation_percentage.toString(),
      });
      setPhotoPreview(asset.photo || null);
    } else {
      setFormData({
        description: '',
        asset_number: '',
        category: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_value: '',
        depreciation_type: 'MENSAL',
        depreciation_percentage: '',
      });
      setPhoto(null);
      setPhotoPreview(null);
    }
  }, [asset, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });
    if (photo) data.append('photo', photo);
    onSave(data);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onClear = () => {
    setFormData({
      description: '',
      asset_number: '',
      category: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_value: '',
      depreciation_type: 'MENSAL',
      depreciation_percentage: '',
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset ? 'Editar Patrimônio' : 'Novo Patrimônio'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-400 transition-colors">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Foto do Patrimônio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
              Descrição <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input 
              required
              type="text" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Número Patrimônio</label>
            <input 
              type="text" 
              value={formData.asset_number}
              onChange={e => setFormData({...formData, asset_number: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Categoria</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            >
              <option value="">SELECIONE</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Data Compra</label>
            <input 
              type="date" 
              value={formData.purchase_date}
              onChange={e => setFormData({...formData, purchase_date: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Valor Compra (R$)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.purchase_value}
              onChange={e => setFormData({...formData, purchase_value: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Tipo Depreciação</label>
            <select 
              value={formData.depreciation_type}
              onChange={e => setFormData({...formData, depreciation_type: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            >
              <option value="DIARIA">DIÁRIA</option>
              <option value="MENSAL">MENSAL</option>
              <option value="ANUAL">ANUAL</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">% Depreciação</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.depreciation_percentage}
              onChange={e => setFormData({...formData, depreciation_percentage: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            type="button"
            onClick={onClear}
            className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors mr-auto uppercase"
          >
            Limpar Campos
          </button>
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
            {asset ? 'ATUALIZAR PATRIMÔNIO' : 'CRIAR PATRIMÔNIO'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface AssetDisposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { disposal_type: string, disposal_date: string, disposal_value: number, asset_id?: number }) => void;
  asset: Asset | null;
  assets?: Asset[];
}

export const AssetDisposalModal = ({ isOpen, onClose, onConfirm, asset, assets = [] }: AssetDisposalModalProps) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [disposalType, setDisposalType] = useState('DESCARTE');
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculatedValue, setCalculatedValue] = useState(0);

  const currentAsset = asset || assets.find(a => a.id === parseInt(selectedAssetId)) || null;

  useEffect(() => {
    if (currentAsset && isOpen) {
      const value = calculateDepreciation(
        currentAsset.purchase_value,
        currentAsset.purchase_date,
        disposalDate,
        currentAsset.depreciation_type,
        currentAsset.depreciation_percentage
      );
      setCalculatedValue(value);
    }
  }, [currentAsset, disposalDate, isOpen]);

  const calculateDepreciation = (purchaseValue: number, purchaseDate: string, disposalDate: string, type: string, percentage: number) => {
    const start = new Date(purchaseDate);
    const end = new Date(disposalDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    
    let periods = 0;
    if (type === 'DIARIA') {
      periods = diffTime / (1000 * 60 * 60 * 24);
    } else if (type === 'MENSAL') {
      periods = diffTime / (1000 * 60 * 60 * 24 * 30.44);
    } else if (type === 'ANUAL') {
      periods = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    }

    const totalDepreciation = (purchaseValue * (percentage / 100)) * periods;
    return Math.max(0, purchaseValue - totalDepreciation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;
    onConfirm({
      disposal_type: disposalType,
      disposal_date: disposalDate,
      disposal_value: calculatedValue,
      asset_id: currentAsset.id
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Baixa de Patrimônio">
      <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
        {!asset ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Selecionar Patrimônio</label>
            <select 
              required
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            >
              <option value="">SELECIONE UM PATRIMÔNIO ATIVO</option>
              {assets.filter(a => a.status === 'ATIVO').map(a => (
                <option key={a.id} value={a.id.toString()}>{`${a.description} (${a.asset_number || 'S/N'})`.toUpperCase()}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500">
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Patrimônio Selecionado</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{asset.description.toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Tipo de Baixa</label>
            <select 
              value={disposalType}
              onChange={e => setDisposalType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            >
              <option value="DESCARTE">DESCARTE</option>
              <option value="DOAÇÃO">DOAÇÃO</option>
              <option value="VENDA">VENDA</option>
              <option value="OUTRO">OUTRO</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Data da Baixa</label>
            <input 
              type="date" 
              value={disposalDate}
              onChange={e => setDisposalDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Valor da Baixa (Calculado)</label>
            <input 
              type="text" 
              value={`R$ ${calculatedValue.toFixed(2)}`}
              readOnly
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg outline-none bg-zinc-50 dark:bg-zinc-800/50 font-bold text-emerald-600 dark:text-emerald-400"
            />
            <p className="mt-2 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
              * Valor calculado automaticamente com base na depreciação ({asset?.depreciation_percentage}% {asset?.depreciation_type.toLowerCase()})
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-8 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-900/10 uppercase"
          >
            Confirmar Baixa
          </button>
        </div>
      </form>
    </Modal>
  );
};
