import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Supplier, Order, Movement } from '../types';
import { Card, cn } from './Common';
import { ProductTable } from './inventory/ProductTable';
import { MovementTable } from './inventory/MovementTable';
import { InventoryFilters } from './inventory/InventoryFilters';
import { ExportButtons } from './inventory/ExportButtons';
import { 
  ProductModal, 
  StockInModal, 
  StockOutModal, 
  MinStockModal, 
  PdfOptionsModal, 
  ProductDetailModal 
} from './inventory/InventoryModals';
import { 
  exportToCSV, 
  exportToPDF, 
  exportMovementsToPDF, 
  exportMovementsToCSV 
} from '../services/exportService';

interface InventoryProps {
  products: Product[];
  categories: {id: number, name: string}[];
  suppliers: Supplier[];
  locations: {id: number, name: string}[];
  orders: Order[];
  movements: Movement[];
  onAddProduct: (p: Partial<Product>) => void;
  onUpdateProduct: (id: number, p: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: number, name: string) => Promise<void>;
  onAddSupplier: (name: string) => Promise<void>;
  onAddLocation: (name: string) => Promise<void>;
  onUpdateLocation: (id: number, name: string) => Promise<void>;
  onStockIn: (data: any) => Promise<void>;
  onStockOut: (data: any) => Promise<void>;
}

export const Inventory = ({ 
  products, 
  categories, 
  suppliers,
  locations,
  orders,
  movements,
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdateCategory,
  onAddSupplier,
  onAddLocation,
  onUpdateLocation,
  onStockIn,
  onStockOut 
}: InventoryProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'movements'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isMinStockModalOpen, setIsMinStockModalOpen] = useState(false);
  const [isPdfOptionsModalOpen, setIsPdfOptionsModalOpen] = useState(false);
  const [selectedPdfFields, setSelectedPdfFields] = useState<string[]>(['id', 'name', 'category', 'quantity', 'unit', 'cost_price', 'status']);
  const [includeTotalValue, setIncludeTotalValue] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
  const [stockOutError, setStockOutError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [stockInError, setStockInError] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'status'; direction: 'asc' | 'desc' } | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [productMovements, setProductMovements] = useState<Movement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [movementLocationFilter, setMovementLocationFilter] = useState<string>('ALL');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['id', 'name', 'category', 'quantity', 'expiry_date', 'min_quantity', 'status']);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALL_COLUMNS = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Produto' },
    { id: 'category', label: 'Categoria' },
    { id: 'quantity', label: 'Estoque' },
    { id: 'expiry_date', label: 'Validade' },
    { id: 'min_quantity', label: 'Mínimo' },
    { id: 'status', label: 'Status' }
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'un',
    photo: '',
    cost_price: 0,
    min_quantity: null as number | null
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        unit: editingProduct.unit,
        photo: editingProduct.photo || '',
        cost_price: editingProduct.cost_price,
        min_quantity: editingProduct.min_quantity
      });
    } else {
      setFormData({
        name: '',
        category: '',
        unit: 'un',
        photo: '',
        cost_price: 0,
        min_quantity: null
      });
    }
  }, [editingProduct]);

  const [stockInData, setStockInData] = useState({
    supplier_id: '',
    doc_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    product_id: '',
    location: '',
    expiry_date: '',
    quantity: 0,
    unit_price: 0
  });

  const [stockOutData, setStockOutData] = useState({
    product_id: '',
    quantity: 0,
    reason: '',
    destination: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProductError('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductError(null);

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, formData);
    } else {
      onAddProduct(formData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const resetStockInForm = () => {
    setStockInData({
      supplier_id: '',
      doc_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      product_id: '',
      location: '',
      expiry_date: '',
      quantity: 0,
      unit_price: 0
    });
    setIsAddingSupplier(false);
    setIsAddingLocation(false);
    setStockInError(null);
    setNewSupplierName('');
    setNewLocationName('');
  };

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStockInError(null);
    if (stockInData.unit_price <= 0) {
      setStockInError('O valor unitário deve ser um número positivo.');
      return;
    }
    onStockIn(stockInData);
    setIsStockInModalOpen(false);
    resetStockInForm();
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStockOutError(null);
    const product = products.find(p => p.id === parseInt(stockOutData.product_id));
    if (product && product.quantity < stockOutData.quantity) {
      setStockOutError(`Não é possível realizar a saída: Quantidade solicitada (${stockOutData.quantity}) é maior que o saldo atual (${product.quantity}).`);
      return;
    }
    onStockOut(stockOutData);
    setIsStockOutModalOpen(false);
    setStockOutData({
      product_id: '',
      quantity: 0,
      reason: '',
      destination: ''
    });
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      if (isEditingCategory && editingCategoryId) {
        await onUpdateCategory(editingCategoryId, newCategoryName.trim());
      } else {
        await onAddCategory(newCategoryName.trim());
      }
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setIsAddingCategory(false);
      setIsEditingCategory(false);
      setEditingCategoryId(null);
    }
  };

  const handleAddSupplier = async () => {
    if (newSupplierName.trim()) {
      await onAddSupplier(newSupplierName.trim());
      setNewSupplierName('');
      setIsAddingSupplier(false);
    }
  };

  const handleAddLocation = async () => {
    if (newLocationName.trim()) {
      if (isEditingLocation && editingLocationId) {
        await onUpdateLocation(editingLocationId, newLocationName.trim());
      } else {
        await onAddLocation(newLocationName.trim());
      }
      setStockInData({ ...stockInData, location: newLocationName.trim() });
      setNewLocationName('');
      setIsAddingLocation(false);
      setIsEditingLocation(false);
      setEditingLocationId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm)
    );

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'status') {
          aValue = (a.min_quantity !== null && a.quantity <= a.min_quantity) ? 0 : 1;
          bValue = (b.min_quantity !== null && b.quantity <= b.min_quantity) ? 0 : 1;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [products, searchTerm, sortConfig]);

  const requestSort = (key: keyof Product | 'status') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Product | 'status') => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown size={12} className="opacity-0 group-hover:opacity-50" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProductForDetail(product);
    setIsLoadingMovements(true);
    try {
      const res = await fetch(`/api/products/${product.id}/movements`);
      if (res.ok) {
        const data = await res.json();
        setProductMovements(data);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setIsLoadingMovements(false);
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch = 
        m.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.doc_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.destination?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const movementDate = new Date(m.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      
      const matchesDate = (!start || movementDate >= start) && (!end || movementDate <= end);
      
      const matchesType = movementTypeFilter === 'ALL' || m.type === movementTypeFilter;
      
      const mLoc = m.type === 'IN' ? m.location : null;
      const matchesLocation = movementLocationFilter === 'ALL' || mLoc === movementLocationFilter;
      
      return matchesSearch && matchesDate && matchesType && matchesLocation;
    });
  }, [movements, searchTerm, startDate, endDate, movementTypeFilter, movementLocationFilter]);

  const handleMenuClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.right - 160 + window.scrollX });
    setActiveMenuId(id);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveSubTab('products')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg transition-colors",
            activeSubTab === 'products' 
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          Produtos
        </button>
        <button 
          onClick={() => setActiveSubTab('movements')}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg transition-colors",
            activeSubTab === 'movements' 
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          )}
        >
          Movimentações
        </button>
      </div>

      <Card className="p-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <InventoryFilters 
            activeSubTab={activeSubTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            movementTypeFilter={movementTypeFilter}
            setMovementTypeFilter={setMovementTypeFilter}
            movementLocationFilter={movementLocationFilter}
            setMovementLocationFilter={setMovementLocationFilter}
            locations={locations}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          <div className="flex items-center gap-3">
            {activeSubTab === 'products' && (
              <div className="relative">
                <button 
                  onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <Settings size={18} />
                  Colunas
                </button>
                <AnimatePresence>
                  {isColumnSelectorOpen && (
                    <>
                      <div className="fixed inset-0 z-[150]" onClick={() => setIsColumnSelectorOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-[160] overflow-hidden p-2"
                      >
                        <div className="space-y-1">
                          {ALL_COLUMNS.map(col => (
                            <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors group">
                              <input 
                                type="checkbox"
                                checked={visibleColumns.includes(col.id)}
                                onChange={() => {
                                  if (visibleColumns.includes(col.id)) {
                                    if (visibleColumns.length > 1) {
                                      setVisibleColumns(visibleColumns.filter(c => c !== col.id));
                                    }
                                  } else {
                                    setVisibleColumns([...visibleColumns, col.id]);
                                  }
                                }}
                                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                              />
                              <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            <ExportButtons 
              activeSubTab={activeSubTab}
              onPdfClick={() => setIsPdfOptionsModalOpen(true)}
              onCsvClick={() => exportToCSV(filteredProducts)}
              onStockOutClick={() => setIsStockOutModalOpen(true)}
              onStockInClick={() => { resetStockInForm(); setIsStockInModalOpen(true); }}
              onNewProductClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              onExportMovementsPdf={() => exportMovementsToPDF(filteredMovements)}
              onExportMovementsCsv={() => exportMovementsToCSV(filteredMovements)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {activeSubTab === 'products' ? (
            <ProductTable 
              products={filteredProducts}
              visibleColumns={visibleColumns}
              requestSort={requestSort}
              getSortIcon={getSortIcon}
              onProductClick={handleProductClick}
              onMenuClick={handleMenuClick}
            />
          ) : (
            <MovementTable movements={filteredMovements} />
          )}
        </div>
      </Card>

      <AnimatePresence>
        {activeMenuId && menuPosition && (
          <>
            <div className="fixed inset-0 z-[150]" onClick={() => setActiveMenuId(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: menuPosition.top, left: menuPosition.left }}
              className="absolute w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-[160] overflow-hidden p-1"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const p = products.find(p => p.id === activeMenuId);
                  if (p) {
                    setEditingProduct(p);
                    setIsModalOpen(true);
                  }
                  setActiveMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition-colors"
              >
                <Edit size={14} />
                Editar Produto
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const p = products.find(p => p.id === activeMenuId);
                  if (p) {
                    setEditingProduct(p);
                    setIsMinStockModalOpen(true);
                  }
                  setActiveMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition-colors"
              >
                <AlertTriangle size={14} />
                Estoque Mínimo
              </button>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Tem certeza que deseja excluir este produto?')) {
                    onDeleteProduct(activeMenuId);
                  }
                  setActiveMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Excluir Produto
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        categories={categories}
        isAddingCategory={isAddingCategory}
        setIsAddingCategory={setIsAddingCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onAddCategory={handleAddCategory}
        productError={productError}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
      />

      <StockInModal 
        isOpen={isStockInModalOpen}
        onClose={() => setIsStockInModalOpen(false)}
        stockInData={stockInData}
        setStockInData={setStockInData}
        onSubmit={handleStockInSubmit}
        suppliers={suppliers}
        isAddingSupplier={isAddingSupplier}
        setIsAddingSupplier={setIsAddingSupplier}
        newSupplierName={newSupplierName}
        setNewSupplierName={setNewSupplierName}
        onAddSupplier={handleAddSupplier}
        locations={locations}
        isAddingLocation={isAddingLocation}
        setIsAddingLocation={setIsAddingLocation}
        newLocationName={newLocationName}
        setNewLocationName={setNewLocationName}
        onAddLocation={handleAddLocation}
        products={products}
        stockInError={stockInError}
      />

      <StockOutModal 
        isOpen={isStockOutModalOpen}
        onClose={() => setIsStockOutModalOpen(false)}
        stockOutData={stockOutData}
        setStockOutData={setStockOutData}
        onSubmit={handleStockOutSubmit}
        products={products}
        orders={orders}
        stockOutError={stockOutError}
        setStockOutError={setStockOutError}
      />

      <MinStockModal 
        isOpen={isMinStockModalOpen}
        onClose={() => setIsMinStockModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
      />

      <PdfOptionsModal 
        isOpen={isPdfOptionsModalOpen}
        onClose={() => setIsPdfOptionsModalOpen(false)}
        selectedPdfFields={selectedPdfFields}
        setSelectedPdfFields={setSelectedPdfFields}
        includeTotalValue={includeTotalValue}
        setIncludeTotalValue={setIncludeTotalValue}
        onExport={() => exportToPDF(filteredProducts, selectedPdfFields, includeTotalValue)}
        ALL_COLUMNS={ALL_COLUMNS}
      />

      <ProductDetailModal 
        isOpen={!!selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        product={selectedProductForDetail}
        movements={productMovements}
        isLoading={isLoadingMovements}
      />
    </>
  );
};
