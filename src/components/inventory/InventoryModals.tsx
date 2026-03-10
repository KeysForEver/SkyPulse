import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Package, AlertTriangle, Plus, Edit, Trash2, ArrowDownLeft, ArrowUpRight, Search, ChevronDown, Barcode, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { Product, Supplier, Order, Movement } from '../../types';
import { Card, cn } from '../Common';
import { useDebounce } from '../../hooks/useDebounce';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  zIndex?: number;
}

const Modal = ({ isOpen, onClose, title, children, zIndex = 200 }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className={cn("fixed inset-0 flex items-center justify-center p-4 sm:p-6", zIndex === 200 ? "z-[200]" : "z-[300]")}>
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
          className="relative w-full md:w-[66.666667%] max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title.toUpperCase()}</h2>
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
  handleFileChange,
  onClear
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
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Nome do Produto <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="EX: CABO DE REDE CAT6"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Categoria <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <div className="flex gap-2">
            <select 
              required
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            >
              <option value="">SELECIONE</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
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
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Unidade <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <select 
            required
            value={formData.unit}
            onChange={e => setFormData({...formData, unit: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
          >
            <option value="un">UNIDADE (UN)</option>
            <option value="kg">QUILOGRAMA (KG)</option>
            <option value="m">METRO (M)</option>
            <option value="l">LITRO (L)</option>
            <option value="cx">CAIXA (CX)</option>
            <option value="par">PAR (PAR)</option>
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Estoque Mínimo (Opcional)</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            value={formData.min_quantity === null ? '' : formData.min_quantity}
            onChange={e => setFormData({...formData, min_quantity: e.target.value === '' ? null : parseFloat(e.target.value)})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
            placeholder="DEIXE VAZIO PARA NÃO DEFINIR MÍNIMO"
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
          {editingProduct ? 'ATUALIZAR PRODUTO' : 'CRIAR PRODUTO'}
        </button>
      </div>

      <Modal isOpen={isAddingCategory} onClose={() => setIsAddingCategory(false)} title="Nova Categoria" zIndex={300}>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
              Nome da Categoria <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input 
              type="text" 
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
              placeholder="NOME DA CATEGORIA"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button 
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={onAddCategory}
              className="px-6 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 uppercase"
            >
              Salvar Categoria
            </button>
          </div>
        </div>
      </Modal>
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
  stockInError,
  onClear
}: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleStartScanning = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador não suporta acesso à câmera ou a conexão não é segura (HTTPS).");
      }
      
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error("Nenhuma câmera encontrada neste dispositivo. Verifique se a webcam está conectada e permitida.");
      }
      
      setIsScanning(true);
    } catch (err: any) {
      console.error("Erro ao acessar câmera:", err);
      setCameraError(err.message || "Não foi possível acessar a câmera.");
    }
  };

  useEffect(() => {
    if (isScanning) {
      const html5QrCode = new Html5Qrcode("scanner-container");
      scannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 150 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
          setStockInData({ ...stockInData, xml: decodedText });
          stopScanning();
        },
        (errorMessage) => {
          // ignore error
        }
      ).catch((err) => {
        console.error("Erro ao iniciar scanner:", err);
        setCameraError("Erro ao iniciar a captura de vídeo. Verifique as permissões da câmera.");
        setIsScanning(false);
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Erro ao parar scanner:", err));
      }
    };
  }, [isScanning]);

  const stopScanning = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        setIsScanning(false);
      }).catch(err => {
        console.error("Erro ao parar scanner:", err);
        setIsScanning(false);
      });
    } else {
      setIsScanning(false);
    }
  };

  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const selectedProduct = products.find((p: Product) => p.id === parseInt(stockInData.product_id));

  useEffect(() => {
    if (!stockInData.product_id) {
      setSearchTerm('');
    }
  }, [stockInData.product_id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Entrada de Estoque">
      <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
        {stockInError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
            <AlertTriangle size={18} />
            {stockInError}
          </div>
        )}

        <AnimatePresence>
          {(isScanning || cameraError) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative bg-black rounded-xl overflow-hidden mb-4"
            >
              {isScanning ? (
                <>
                  <div id="scanner-container" className="w-full aspect-video"></div>
                  <button 
                    type="button"
                    onClick={stopScanning}
                    className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/50 inline-block px-3 py-1 rounded-full">
                      Aponte para o código de barras da NF-e
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="text-rose-500" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold uppercase tracking-wider">Erro de Hardware</h3>
                    <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                      {cameraError}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setCameraError(null)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors uppercase"
                  >
                    Fechar Aviso
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {/* Linha 1: Produto */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
              Produto <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <div 
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Search size={16} className="text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Pesquisar produto..."
                  value={isDropdownOpen ? searchTerm : (selectedProduct ? selectedProduct.name : '')}
                  onChange={e => {
                    setSearchTerm(e.target.value.toUpperCase());
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <ChevronDown size={16} className={cn("text-zinc-400 transition-transform", isDropdownOpen && "rotate-180")} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[210] left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p: Product) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setStockInData({...stockInData, product_id: p.id.toString()});
                            setSearchTerm('');
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between",
                            stockInData.product_id === p.id.toString() && "bg-zinc-50 dark:bg-zinc-800 font-bold"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="text-zinc-900 dark:text-zinc-100">{p.name}</span>
                          </div>
                          <span className="text-xs text-zinc-400 uppercase">Saldo: {p.quantity}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-zinc-500 text-center">Nenhum produto encontrado</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input type="hidden" required value={stockInData.product_id} />
          </div>

          {/* Linha 2: Quantidade e Localização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Quantidade <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input 
                required
                type="number" 
                min="0.01"
                step="0.01"
                value={stockInData.quantity || ''}
                onChange={e => setStockInData({...stockInData, quantity: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Localização <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <select 
                  required
                  value={stockInData.location}
                  onChange={e => setStockInData({...stockInData, location: e.target.value})}
                  className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
                >
                  <option value="">SELECIONE</option>
                  {locations.map((l: any) => (
                    <option key={l.id} value={l.name}>{l.name.toUpperCase()}</option>
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

          {/* Linha 3: Fornecedor e Documento Fiscal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Fornecedor <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <select 
                  required
                  value={stockInData.supplier_id}
                  onChange={e => setStockInData({...stockInData, supplier_id: e.target.value})}
                  className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
                >
                  <option value="">SELECIONE</option>
                  {suppliers.map((s: Supplier) => (
                    <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
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
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Documento Fiscal</label>
              <input 
                type="text" 
                value={stockInData.doc_number}
                onChange={e => setStockInData({...stockInData, doc_number: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                placeholder="NF-E, RECIBO, ETC"
              />
            </div>
          </div>

          {/* Linha 4: Nota Fiscal (PDF) e XML */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Nota Fiscal (PDF)</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    multiple
                    accept=".pdf"
                    className="hidden"
                    id="invoice-upload"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file: File) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setStockInData((prev: any) => ({
                            ...prev,
                            invoices: [...(prev.invoices || []), { name: file.name, data: reader.result as string }]
                          }));
                        };
                        reader.readAsDataURL(file);
                      });
                      e.target.value = ''; // Reset input to allow same file selection
                    }}
                  />
                  <label 
                    htmlFor="invoice-upload"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <FileText size={18} />
                    <span>ADICIONAR PDF</span>
                  </label>
                </div>
                
                {stockInData.invoices && stockInData.invoices.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {stockInData.invoices.map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg text-[11px]">
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={14} className="text-zinc-400 flex-shrink-0" />
                          <span className="text-zinc-600 dark:text-zinc-300 truncate">{file.name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newInvoices = [...stockInData.invoices];
                            newInvoices.splice(index, 1);
                            setStockInData({...stockInData, invoices: newInvoices});
                          }}
                          className="text-rose-500 hover:text-rose-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">XML (Chave de Acesso)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={stockInData.xml}
                  onChange={e => setStockInData({...stockInData, xml: e.target.value.toUpperCase()})}
                  className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                  placeholder="CHAVE DA NOTA FISCAL"
                />
                <button 
                  type="button"
                  onClick={handleStartScanning}
                  className="p-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/10"
                  title="Escanear Código de Barras"
                >
                  <Barcode size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Linha 5: Data de Emissão e Valor Unitário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Data de Emissão <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input 
                required
                type="date" 
                value={stockInData.issue_date}
                onChange={e => setStockInData({...stockInData, issue_date: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Valor Unitário (R$)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                value={stockInData.unit_price || ''}
                onChange={e => setStockInData({...stockInData, unit_price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            type="button"
            onClick={() => {
              setCameraError(null);
              onClear();
            }}
            className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors mr-auto uppercase"
          >
            Limpar Campos
          </button>
          <button 
            type="button"
            onClick={() => {
              setCameraError(null);
              onClose();
            }}
            className="px-6 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-8 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 uppercase"
          >
            Confirmar Entrada
          </button>
        </div>

        <Modal isOpen={isAddingLocation} onClose={() => setIsAddingLocation(false)} title="Nova Localização" zIndex={300}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Nome da Localização <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input 
                type="text" 
                value={newLocationName}
                onChange={e => setNewLocationName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                placeholder="EX: PRATELEIRA A1"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                type="button"
                onClick={() => setIsAddingLocation(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={onAddLocation}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 uppercase"
              >
                Salvar Localização
              </button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isAddingSupplier} onClose={() => setIsAddingSupplier(false)} title="Novo Fornecedor" zIndex={300}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                Nome do Fornecedor <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input 
                type="text" 
                value={newSupplierName}
                onChange={e => setNewSupplierName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
                placeholder="NOME DA EMPRESA"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                type="button"
                onClick={() => setIsAddingSupplier(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors uppercase"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={onAddSupplier}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 uppercase"
              >
                Salvar Fornecedor
              </button>
            </div>
          </div>
        </Modal>
      </form>
    </Modal>
  );
};

export const StockOutModal = ({
  isOpen,
  onClose,
  stockOutData,
  setStockOutData,
  onSubmit,
  products,
  orders,
  stockOutError,
  setStockOutError,
  onClear
}: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const selectedProduct = products.find((p: Product) => p.id === parseInt(stockOutData.product_id));

  useEffect(() => {
    if (!stockOutData.product_id) {
      setSearchTerm('');
    }
  }, [stockOutData.product_id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Saída de Estoque">
      <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
        {stockOutError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
            <AlertTriangle size={18} />
            {stockOutError}
          </div>
        )}
        
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Produto <span className="text-rose-500 ml-0.5">*</span> {selectedProduct && (
              <span className="ml-2 text-zinc-400 uppercase">
                (Saldo: {selectedProduct.quantity > 0 ? selectedProduct.quantity : '-'})
              </span>
            )}
          </label>
          <div className="relative">
            <div 
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Search size={16} className="text-zinc-400" />
              <input 
                type="text"
                placeholder="Pesquisar produto..."
                value={isDropdownOpen ? searchTerm : (selectedProduct ? selectedProduct.name : '')}
                onChange={e => {
                  setSearchTerm(e.target.value.toUpperCase());
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <ChevronDown size={16} className={cn("text-zinc-400 transition-transform", isDropdownOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-[210] left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                >
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p: Product) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setStockOutData({...stockOutData, product_id: p.id.toString()});
                          setStockOutError(null);
                          setSearchTerm('');
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between",
                          stockOutData.product_id === p.id.toString() && "bg-zinc-50 dark:bg-zinc-800 font-bold"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-zinc-100">{p.name}</span>
                        </div>
                        <span className="text-xs text-zinc-400">Saldo: {p.quantity > 0 ? p.quantity : '-'}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-zinc-500 text-center">Nenhum produto encontrado</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input type="hidden" required value={stockOutData.product_id} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Quantidade <span className="text-rose-500 ml-0.5">*</span>
          </label>
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
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Motivo da Saída <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <select 
            required
            value={stockOutData.reason}
            onChange={e => setStockOutData({...stockOutData, reason: e.target.value, destination: ''})}
            className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
          >
            <option value="">SELECIONE UM MOTIVO</option>
            <option value="venda">VENDA</option>
            <option value="consumo interno">CONSUMO INTERNO</option>
            <option value="devolução">DEVOLUÇÃO</option>
            <option value="perda/dano">PERDA/DANO</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            Destino / Ordem de Produção <span className="text-rose-500 ml-0.5">*</span>
          </label>
          {stockOutData.reason === 'venda' ? (
            <select
              required
              value={stockOutData.destination}
              onChange={e => setStockOutData({...stockOutData, destination: e.target.value})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 uppercase"
            >
              <option value="">SELECIONE UMA ORDEM DE PRODUÇÃO</option>
              {orders.map((order: Order) => (
                <option key={order.id} value={order.title}>{order.title.toUpperCase()} (#{order.id})</option>
              ))}
            </select>
          ) : (
            <input 
              required
              type="text" 
              value={stockOutData.destination}
              onChange={e => setStockOutData({...stockOutData, destination: e.target.value.toUpperCase()})}
              className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
              placeholder="EX: SETOR DE MANUTENÇÃO"
            />
          )}
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
            className="px-8 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/10 uppercase"
          >
            Confirmar Saída
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const PdfOptionsModal = ({
  isOpen,
  onClose,
  selectedPdfFields,
  setSelectedPdfFields,
  includeTotalValue,
  setIncludeTotalValue,
  onExport,
  ALL_COLUMNS,
  onClear
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
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 uppercase">{col.label}</span>
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
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 uppercase">Incluir Valor Total do Estoque</span>
        </label>
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
          onClick={onExport}
          className="px-8 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 uppercase"
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
  isLoading,
  onEdit,
  onDelete
}: any) => (
  <AnimatePresence>
    {isOpen && product && (
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
          className="relative w-full md:w-[66.666667%] max-w-5xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{product.name}</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Detalhes do Produto</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEdit(product)}
                className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors shadow-sm"
                title="Editar"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este produto?')) {
                    onDelete(product.id);
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
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {product.quantity} {product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Estoque Mínimo</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.min_quantity ?? 'Não definido'} {product.min_quantity !== null ? product.unit : ''}</p>
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
                            <div className="flex flex-col gap-1">
                              <span>{m.type === 'IN' ? (m.doc_number || '-') : (m.reason || '-')}</span>
                              {m.invoice_pdf && (
                                <div className="flex flex-wrap gap-1">
                                  {(() => {
                                    try {
                                      const invoices = JSON.parse(m.invoice_pdf);
                                      if (Array.isArray(invoices)) {
                                        return invoices.map((file: any, idx: number) => (
                                          <button 
                                            key={idx}
                                            onClick={() => {
                                              const link = document.createElement('a');
                                              link.href = file.data;
                                              link.target = '_blank';
                                              link.download = file.name;
                                              link.click();
                                            }}
                                            className="inline-flex items-center gap-1 px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded text-[8px] transition-colors"
                                            title={`Baixar ${file.name}`}
                                          >
                                            <FileText size={8} />
                                            <span className="truncate max-w-[40px]">{file.name}</span>
                                          </button>
                                        ));
                                      }
                                    } catch (e) {
                                      return (
                                        <button 
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = m.invoice_pdf!;
                                            link.target = '_blank';
                                            link.download = `NF-${m.doc_number || m.id}.pdf`;
                                            link.click();
                                          }}
                                          className="inline-flex items-center gap-1 px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded text-[8px] transition-colors"
                                          title="Baixar Nota Fiscal"
                                        >
                                          <FileText size={8} />
                                          <span>NF-PDF</span>
                                        </button>
                                      );
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
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
