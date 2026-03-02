import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  HardDrive, 
  ClipboardList, 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle,
  Plus,
  Search,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  FileText,
  Edit,
  Trash2,
  Settings,
  Download,
  Camera,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product, Client, Supplier, Asset, Order, Movement, OrderStatus } from './types';
import { KANBAN_COLUMNS } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
      active 
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Card = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string }) => (
  <div className={cn("bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800", className)}>
    {title && (
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, trend, color }: { label: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <Card className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">{label}</span>
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <div className="flex items-end gap-2 mt-2">
      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
      {trend && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">{trend}</span>}
    </div>
  </Card>
);

// --- Pages ---

const Dashboard = ({ stats, isDarkMode }: { stats: any, isDarkMode: boolean }) => {
  const chartData = [
    { name: 'Seg', v: 400 },
    { name: 'Ter', v: 300 },
    { name: 'Qua', v: 600 },
    { name: 'Qui', v: 800 },
    { name: 'Sex', v: 500 },
  ];

  const textColor = isDarkMode ? '#a1a1aa' : '#71717a';
  const gridColor = isDarkMode ? '#27272a' : '#f1f1f1';
  const barColor = isDarkMode ? '#f4f4f5' : '#18181b';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Produtos" value={stats?.totalProducts || 0} icon={Package} color="bg-blue-500" />
        <StatCard label="Estoque Baixo" value={stats?.lowStock || 0} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard label="Ordens Ativas" value={stats?.activeOrders || 0} icon={ClipboardList} color="bg-indigo-500" />
        <StatCard label="Clientes" value={12} icon={Users} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Movimentações de Estoque">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: textColor}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: textColor}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                    color: isDarkMode ? '#f4f4f5' : '#18181b'
                  }}
                  itemStyle={{ color: isDarkMode ? '#f4f4f5' : '#18181b' }}
                />
                <Bar dataKey="v" fill={barColor} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Atividades Recentes">
          <div className="space-y-4">
            {stats?.recentMovements?.map((m: Movement) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  m.type === 'IN' 
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                )}>
                  {m.type === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{m.product_name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{m.type === 'IN' ? 'Entrada' : 'Saída'} • {m.quantity} un</p>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                  {new Date(m.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const Inventory = ({ 
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
  onAddSupplier,
  onAddLocation,
  onStockIn,
  onStockOut 
}: { 
  products: Product[], 
  categories: {id: number, name: string}[], 
  suppliers: Supplier[],
  locations: {id: number, name: string}[],
  orders: Order[],
  movements: Movement[],
  onAddProduct: (p: Partial<Product>) => void, 
  onUpdateProduct: (id: number, p: Partial<Product>) => Promise<void>,
  onDeleteProduct: (id: number) => Promise<void>,
  onAddCategory: (name: string) => Promise<void>,
  onAddSupplier: (name: string) => Promise<void>,
  onAddLocation: (name: string) => Promise<void>,
  onStockIn: (data: any) => Promise<void>,
  onStockOut: (data: any) => Promise<void>
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'movements'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isMinStockModalOpen, setIsMinStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
  const [stockOutError, setStockOutError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [stockInError, setStockInError] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'un',
    photo: '',
    min_quantity: null as number | null
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        unit: editingProduct.unit,
        photo: editingProduct.photo || '',
        min_quantity: editingProduct.min_quantity
      });
    } else {
      setFormData({
        name: '',
        category: '',
        unit: 'un',
        photo: '',
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
      await onAddCategory(newCategoryName.trim());
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setIsAddingCategory(false);
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
      await onAddLocation(newLocationName.trim());
      setNewLocationName('');
      setIsAddingLocation(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Categoria', 'Estoque', 'Unidade', 'Preço de Custo', 'Estoque Mínimo', 'Status'];
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category,
      p.quantity,
      p.unit,
      p.cost_price,
      p.min_quantity ?? '-',
      (p.min_quantity !== null && p.quantity <= p.min_quantity) ? 'Estoque Baixo' : 'Normal'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estoque_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['ID', 'Nome', 'Categoria', 'Estoque', 'Unidade', 'V. Unitário', 'Mínimo', 'Status'];
    const tableRows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category,
      p.quantity,
      p.unit,
      `R$ ${p.cost_price.toFixed(2)}`,
      p.min_quantity ?? '-',
      (p.min_quantity !== null && p.quantity <= p.min_quantity) ? 'Estoque Baixo' : 'Normal'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
    });

    doc.text('Relatório de Estoque', 14, 15);
    doc.save(`estoque_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportMovementsPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Data', 'Tipo', 'Produto', 'Qtd', 'Origem/Destino', 'Doc/Motivo'];
    const tableRows = filteredMovements.map(m => {
      const date = new Date(m.date).toLocaleString('pt-BR');
      const type = m.type === 'IN' ? 'Entrada' : 'Saída';
      const origin = m.type === 'IN' ? (m.supplier_name || m.location) : m.destination;
      const docVal = m.type === 'IN' ? m.doc_number : m.reason;
      return [date, type, m.product_name, m.quantity, origin, docVal];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
    });

    doc.text('Relatório de Movimentações de Estoque', 14, 15);
    doc.save(`movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`);
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
      
      return matchesSearch && matchesDate;
    });
  }, [movements, searchTerm, startDate, endDate]);

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
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder={activeSubTab === 'products' ? "Buscar produtos..." : "Buscar movimentações..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>
            {activeSubTab === 'movements' && (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                />
                <span className="text-zinc-400 dark:text-zinc-500 text-xs font-bold">até</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-100"
                />
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="p-2 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
                    title="Limpar filtros"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeSubTab === 'products' ? (
              <>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <FileText size={18} />
                  PDF
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <Download size={18} />
                  CSV
                </button>
                <button 
                  onClick={() => setIsStockOutModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                >
                  <ArrowUpRight size={18} />
                  Saída
                </button>
                <button 
                  onClick={() => {
                    resetStockInForm();
                    setIsStockInModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                >
                  <ArrowDownLeft size={18} />
                  Entrada
                </button>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:shadow-none"
                >
                  <Plus size={18} />
                  Novo Produto
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportMovementsPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  <FileText size={18} />
                  PDF
                </button>
                <button 
                  onClick={() => {
                    const headers = "Data,Tipo,Produto,Quantidade,Origem/Destino,Documento/Motivo\n";
                  const rows = filteredMovements.map(m => {
                    const date = new Date(m.date).toLocaleString('pt-BR');
                    const type = m.type === 'IN' ? 'Entrada' : 'Saída';
                    const origin = m.type === 'IN' ? (m.supplier_name || m.location) : m.destination;
                    const doc = m.type === 'IN' ? m.doc_number : m.reason;
                    return `"${date}","${type}","${m.product_name}","${m.quantity}","${origin}","${doc}"`;
                  }).join("\n");
                  
                  const csvContent = headers + rows;
                  const BOM = '\uFEFF';
                  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `movimentacoes_estoque_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                <Download size={18} />
                CSV
              </button>
            </div>
          )}
        </div>
      </div>
        <div className="overflow-x-auto">
          {activeSubTab === 'products' ? (
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <th 
                  onClick={() => requestSort('id')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    ID
                    {getSortIcon('id')}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('name')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    Produto
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('category')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    Categoria
                    {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('quantity')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    Estoque
                    {getSortIcon('quantity')}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('expiry_date')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    Validade
                    {getSortIcon('expiry_date')}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('min_quantity')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    Mínimo
                    {getSortIcon('min_quantity')}
                  </div>
                </th>
                <th 
                  onClick={() => requestSort('status')}
                  className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredProducts.map((p) => {
                const isLowStock = p.min_quantity !== null && p.quantity <= p.min_quantity;
                return (
                  <tr 
                    key={p.id} 
                    onClick={() => handleProductClick(p)}
                    className={cn(
                      "transition-colors cursor-pointer",
                      isLowStock 
                        ? "bg-amber-50/50 hover:bg-amber-100/50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10" 
                        : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 font-mono">#{p.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-3">
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} className="w-8 h-8 rounded object-cover border border-zinc-100 dark:border-zinc-800" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                            <Package size={14} />
                          </div>
                        )}
                        {p.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">{p.category}</td>
                    <td className={cn(
                      "px-6 py-4 text-sm font-medium",
                      isLowStock ? "text-amber-600 dark:text-amber-400 flex items-center gap-2" : "text-zinc-900 dark:text-zinc-100"
                    )}>
                      {isLowStock && <AlertTriangle size={14} />}
                      {p.quantity} {p.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">{p.min_quantity ?? '-'} {p.unit}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold uppercase rounded-full",
                      (p.min_quantity !== null && p.quantity <= p.min_quantity)
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" 
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    )}>
                      {(p.min_quantity !== null && p.quantity <= p.min_quantity) ? 'Estoque Baixo' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (activeMenuId === p.id) {
                          setActiveMenuId(null);
                          setMenuPosition(null);
                        } else {
                          setActiveMenuId(p.id);
                          setMenuPosition({
                            top: rect.bottom + 8,
                            left: rect.right - 192
                          });
                        }
                      }}
                      className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeMenuId === p.id && menuPosition && createPortal(
                      <div className="fixed inset-0 z-[200]">
                        <div 
                          className="absolute inset-0" 
                          onClick={() => {
                            setActiveMenuId(null);
                            setMenuPosition(null);
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          style={{ 
                            top: menuPosition.top, 
                            left: menuPosition.left,
                            position: 'fixed'
                          }}
                          className="w-48 bg-white border border-zinc-200 rounded-xl shadow-xl z-[210] overflow-hidden"
                        >
                          <div className="p-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsMinStockModalOpen(true);
                                setActiveMenuId(null);
                                setMenuPosition(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                            >
                              <Settings size={14} />
                              Estoque Mínimo
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsModalOpen(true);
                                setActiveMenuId(null);
                                setMenuPosition(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors"
                            >
                              <Edit size={14} />
                              Editar
                            </button>
                            <div className="h-px bg-zinc-100 my-1" />
                            <button
                              onClick={() => {
                                onDeleteProduct(p.id);
                                setActiveMenuId(null);
                                setMenuPosition(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          </div>
                        </motion.div>
                      </div>,
                      document.body
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Qtd</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Origem/Destino</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Doc/Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500 text-sm">Nenhuma movimentação encontrada para os filtros selecionados.</td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(m.date).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          m.type === 'IN' 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                        )}>
                          {m.type === 'IN' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                          {m.type === 'IN' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{m.product_name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">{m.quantity}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                        {m.type === 'IN' ? (m.supplier_name || m.location) : m.destination}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {m.type === 'IN' ? m.doc_number : m.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modal Detalhes do Produto */}
      <AnimatePresence>
        {selectedProductForDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-zinc-800"
            >
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{selectedProductForDetail.name}</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">ID: #{selectedProductForDetail.id}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProductForDetail(null)} 
                  className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    {selectedProductForDetail.photo ? (
                      <img 
                        src={selectedProductForDetail.photo} 
                        alt={selectedProductForDetail.name} 
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
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedProductForDetail.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Unidade</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedProductForDetail.unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Estoque Atual</p>
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-bold",
                          (selectedProductForDetail.min_quantity !== null && selectedProductForDetail.quantity <= selectedProductForDetail.min_quantity) 
                            ? "text-amber-600 dark:text-amber-400" 
                            : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {selectedProductForDetail.quantity} {selectedProductForDetail.unit}
                        </p>
                        {(selectedProductForDetail.min_quantity !== null && selectedProductForDetail.quantity <= selectedProductForDetail.min_quantity) && (
                          <AlertTriangle size={14} className="text-amber-500 dark:text-amber-400" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Estoque Mínimo</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedProductForDetail.min_quantity ?? 'Não definido'} {selectedProductForDetail.min_quantity !== null ? selectedProductForDetail.unit : ''}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Data de Validade</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {selectedProductForDetail.expiry_date ? new Date(selectedProductForDetail.expiry_date).toLocaleDateString('pt-BR') : 'Não informada'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Histórico de Movimentações */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <ClipboardList size={16} className="text-zinc-400 dark:text-zinc-500" />
                      Histórico de Movimentações
                    </h3>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                          <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Data</th>
                          <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tipo</th>
                          <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Qtd</th>
                          <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">V. Unitário</th>
                          <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Origem/Destino</th>
                          <th className="px-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Doc/Motivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {isLoadingMovements ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">Carregando histórico...</td>
                          </tr>
                        ) : productMovements.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">Nenhuma movimentação encontrada.</td>
                          </tr>
                        ) : (
                          productMovements.map((m) => (
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
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                                )}>
                                  {m.type === 'IN' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                  {m.type === 'IN' ? 'Entrada' : 'Saída'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {m.quantity} {selectedProductForDetail.unit}
                              </td>
                              <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                                {m.type === 'IN' ? `R$ ${m.unit_price?.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                                {m.type === 'IN' ? m.supplier_name || m.location : m.destination || '-'}
                              </td>
                              <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
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

              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end flex-shrink-0">
                <button 
                  onClick={() => setSelectedProductForDetail(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Entrada de Estoque */}
      <AnimatePresence>
        {isStockInModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-zinc-800"
            >
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Entrada de Estoque</h2>
                <button onClick={() => {
                  setIsStockInModalOpen(false);
                  resetStockInForm();
                }} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleStockInSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                {stockInError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
                    <AlertTriangle size={18} />
                    {stockInError}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-6">
                  {/* Row 1 */}
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Fornecedor</label>
                    <div className="flex gap-2">
                      {isAddingSupplier ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={newSupplierName}
                            onChange={e => setNewSupplierName(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                          />
                          <button 
                            type="button"
                            onClick={handleAddSupplier}
                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            OK
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsAddingSupplier(false)}
                            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <select 
                            required
                            value={stockInData.supplier_id}
                            onChange={e => setStockInData({...stockInData, supplier_id: e.target.value})}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="">Selecione um fornecedor</option>
                            {suppliers.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button 
                            type="button"
                            onClick={() => setIsAddingSupplier(true)}
                            className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
                          >
                            <Plus size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Nº Doc / NF</label>
                    <input 
                      required
                      type="text" 
                      value={stockInData.doc_number}
                      onChange={e => setStockInData({...stockInData, doc_number: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Data Emissão</label>
                    <input 
                      required
                      type="date" 
                      value={stockInData.issue_date}
                      onChange={e => setStockInData({...stockInData, issue_date: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Produto</label>
                    <select 
                      required
                      value={stockInData.product_id}
                      onChange={e => setStockInData({...stockInData, product_id: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">Selecione um produto</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Data Validade</label>
                    <input 
                      type="date" 
                      value={stockInData.expiry_date}
                      onChange={e => setStockInData({...stockInData, expiry_date: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Local de Estoque</label>
                    <div className="flex gap-2">
                      {isAddingLocation ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={newLocationName}
                            onChange={e => setNewLocationName(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                          />
                          <button 
                            type="button"
                            onClick={handleAddLocation}
                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            OK
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsAddingLocation(false)}
                            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <select 
                            required
                            value={stockInData.location}
                            onChange={e => setStockInData({...stockInData, location: e.target.value})}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="">Selecione um local</option>
                            {locations.map(l => (
                              <option key={l.id} value={l.name}>{l.name}</option>
                            ))}
                          </select>
                          <button 
                            type="button"
                            onClick={() => setIsAddingLocation(true)}
                            className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
                          >
                            <Plus size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 4 */}
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
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Valor Unitário (R$)</label>
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
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsStockInModalOpen(false);
                      resetStockInForm();
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Confirmar Entrada
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Saída de Estoque */}
      <AnimatePresence>
        {isStockOutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border dark:border-zinc-800"
            >
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Saída de Estoque</h2>
                <button onClick={() => setIsStockOutModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleStockOutSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                {stockOutError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
                    <AlertTriangle size={18} />
                    {stockOutError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Produto</label>
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
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity})</option>
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
                      {orders.map(order => (
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
                    />
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsStockOutModalOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Confirmar Saída
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Novo Produto */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border dark:border-zinc-800"
            >
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h2>
                <button onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  setProductError(null);
                }} className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto overflow-x-hidden flex-1">
                {productError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
                    <AlertTriangle size={18} />
                    {productError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Nome do Produto</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Categoria</label>
                    <div className="flex gap-2">
                      {isAddingCategory ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                          />
                          <button 
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            OK
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsAddingCategory(false)}
                            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <select 
                            required
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="">Selecione uma categoria</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                          <button 
                            type="button"
                            onClick={() => setIsAddingCategory(true)}
                            className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-emerald-800 dark:hover:bg-emerald-700"
                          >
                            <Plus size={16} />
                          </button>
                        </>
                      )}
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
                      <option value="m">Metro (m)</option>
                      <option value="kg">Quilo (kg)</option>
                      <option value="cx">Caixa (cx)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Estoque Mínimo</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        disabled={formData.min_quantity === null}
                        value={formData.min_quantity === null ? '' : formData.min_quantity}
                        onChange={e => setFormData({...formData, min_quantity: e.target.value === '' ? null : parseInt(e.target.value)})}
                        className={cn(
                          "flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
                          formData.min_quantity === null && "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-800"
                        )}
                        placeholder="Não definido"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, min_quantity: formData.min_quantity === null ? 0 : null})}
                        className={cn(
                          "px-3 py-2 text-[10px] font-bold uppercase rounded-lg border transition-colors flex-shrink-0",
                          formData.min_quantity === null 
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" 
                            : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        )}
                      >
                        {formData.min_quantity === null ? 'Definir' : 'Ignorar'}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Foto do Produto</label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 border-dashed flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 overflow-hidden group flex-shrink-0">
                        {formData.photo ? (
                          <>
                            <img src={formData.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, photo: ''})}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Camera size={24} strokeWidth={1.5} />
                            <span className="text-[10px] font-medium">Upload</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 leading-relaxed">
                          Clique no ícone para fazer upload de uma foto ou tirar uma foto com a câmera.
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          Formatos aceitos: JPG, PNG. Máx: 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Estoque Mínimo */}
      <AnimatePresence>
        {isMinStockModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-zinc-900">Estoque Mínimo</h2>
                <button onClick={() => {
                  setIsMinStockModalOpen(false);
                  setEditingProduct(null);
                }} className="text-zinc-400 hover:text-zinc-600">
                  <X size={20} />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateProduct(editingProduct.id, { ...editingProduct, min_quantity: formData.min_quantity });
                  setIsMinStockModalOpen(false);
                  setEditingProduct(null);
                }} 
                className="p-6 space-y-4 overflow-y-auto flex-1"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Produto</label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{editingProduct.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Quantidade Mínima</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      disabled={formData.min_quantity === null}
                      value={formData.min_quantity === null ? '' : formData.min_quantity}
                      onChange={e => setFormData({...formData, min_quantity: e.target.value === '' ? null : parseFloat(e.target.value)})}
                      className={cn(
                        "flex-1 px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
                        formData.min_quantity === null && "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-800"
                      )}
                      placeholder="Não definido"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, min_quantity: formData.min_quantity === null ? 0 : null})}
                      className={cn(
                        "px-3 py-2 text-[10px] font-bold uppercase rounded-lg border transition-colors",
                        formData.min_quantity === null 
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100" 
                          : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      {formData.min_quantity === null ? 'Definir' : 'Ignorar'}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formData.min_quantity === null 
                      ? "O sistema não emitirá alertas de estoque baixo para este produto." 
                      : "O sistema emitirá um alerta quando o estoque for igual ou inferior a este valor."}
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMinStockModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Kanban = ({ orders, onUpdateStatus }: { orders: Order[], onUpdateStatus: (id: number, status: OrderStatus) => void }) => {
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
            placeholder="Buscar ordens..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
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
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{order.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">{order.description || 'Sem descrição'}</p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-[8px] text-white dark:text-zinc-900 font-bold">
                      {order.client_name?.charAt(0) || 'C'}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{order.client_name}</span>
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

const GenericList = ({ title, items, columns }: { title: string, items: any[], columns: { key: string, label: string, mono?: boolean }[] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      columns.some(col => 
        item[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [items, searchTerm, columns]);

  return (
    <Card className="p-0">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{title}</h3>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={14} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
          <Plus size={16} />
          Novo
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{col.label}</th>
              ))}
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={cn("px-6 py-4 text-sm", col.mono ? "font-mono text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100")}>
                    {item[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm italic">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// --- Main App ---

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [locations, setLocations] = useState<{id: number, name: string}[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchData();

    // WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ORDER_UPDATED' || data.type === 'INVENTORY_UPDATED') {
        fetchData();
      }
    };

    return () => ws.close();
  }, []);

  const fetchData = async () => {
    try {
      const endpoints = [
        { key: 'stats', url: '/api/stats', setter: setStats },
        { key: 'products', url: '/api/products', setter: setProducts },
        { key: 'orders', url: '/api/orders', setter: setOrders },
        { key: 'clients', url: '/api/clients', setter: setClients },
        { key: 'suppliers', url: '/api/suppliers', setter: setSuppliers },
        { key: 'assets', url: '/api/assets', setter: setAssets },
        { key: 'categories', url: '/api/categories', setter: setCategories },
        { key: 'locations', url: '/api/locations', setter: setLocations },
        { key: 'movements', url: '/api/movements', setter: setMovements },
      ];

      await Promise.all(endpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint.url);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          endpoint.setter(data);
        } catch (err) {
          console.error(`Error fetching ${endpoint.key}:`, err);
        }
      }));
    } catch (err) {
      console.error('Error in fetchData:', err);
    }
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const addProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...productData, quantity: 0 })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const addCategory = async (name: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const addSupplier = async (name: string) => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact: '' })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const addLocation = async (name: string) => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error adding location:', err);
    }
  };

  const handleStockIn = async (data: any) => {
    try {
      const res = await fetch('/api/inventory/in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error in stock in:', err);
    }
  };

  const handleStockOut = async (data: any) => {
    try {
      const res = await fetch('/api/inventory/out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao processar saída');
      }
    } catch (err) {
      console.error('Error in stock out:', err);
    }
  };

  const handleUpdateProduct = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao atualizar produto');
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao excluir produto');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard stats={stats} isDarkMode={isDarkMode} />;
      case 'inventory': return (
        <Inventory 
          products={products} 
          categories={categories} 
          suppliers={suppliers}
          locations={locations}
          orders={orders}
          movements={movements}
          onAddProduct={addProduct} 
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddCategory={addCategory} 
          onAddSupplier={addSupplier}
          onAddLocation={addLocation}
          onStockIn={handleStockIn}
          onStockOut={handleStockOut}
        />
      );
      case 'production': return (
        <GenericList 
          title="Ordens de Produção" 
          items={orders} 
          columns={[
            { key: 'id', label: 'ID', mono: true },
            { key: 'title', label: 'Título' },
            { key: 'status', label: 'Status' },
            { key: 'client_name', label: 'Cliente' }
          ]} 
        />
      );
      case 'kanban': return <Kanban orders={orders} onUpdateStatus={updateOrderStatus} />;
      case 'clients': return (
        <GenericList 
          title="Clientes" 
          items={clients} 
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'E-mail' },
            { key: 'phone', label: 'Telefone' }
          ]} 
        />
      );
      case 'suppliers': return (
        <GenericList 
          title="Fornecedores" 
          items={suppliers} 
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'contact', label: 'Contato' }
          ]} 
        />
      );
      case 'assets': return (
        <GenericList 
          title="Patrimônios" 
          items={assets} 
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'code', label: 'Código', mono: true },
            { key: 'status', label: 'Status' }
          ]} 
        />
      );
      default: return <div className="flex items-center justify-center h-64 text-zinc-400">Em desenvolvimento...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transition-transform lg:relative lg:translate-x-0 dark:bg-zinc-900 dark:border-zinc-800",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center dark:bg-zinc-100">
                <Package className="text-white dark:text-zinc-900" size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight dark:text-white">SkyPulse</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 dark:text-zinc-500">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={ClipboardList} label="Kanban" active={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} />
            <SidebarItem icon={FileText} label="Ordem de Produção" active={activeTab === 'production'} onClick={() => setActiveTab('production')} />
            <SidebarItem icon={Users} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            <SidebarItem icon={Truck} label="Fornecedores" active={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
            <SidebarItem icon={HardDrive} label="Patrimônios" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
            <SidebarItem icon={Package} label="Estoque" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          </nav>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Administrador</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">admin@pro.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 flex-shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-zinc-400 dark:text-zinc-500">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors"
              title={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
