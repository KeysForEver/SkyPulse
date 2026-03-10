import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  HardDrive, 
  ClipboardList, 
  Menu, 
  X, 
  Settings, 
  DollarSign, 
  FileText,
  RotateCcw,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Client, Supplier, Asset, Order, Movement, OrderStatus } from './types';
import { apiService } from './services/apiService';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Kanban } from './components/Kanban';
import { GenericList } from './components/GenericList';
import { Settings as SettingsView } from './components/Settings';
import { SidebarItem, cn } from './components/Common';
import { OrderModal } from './components/OrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';

// --- Main App ---

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch (err) {
        // This often fails if not in fullscreen or not supported, which is expected
      }
    };
    lockOrientation();
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [locations, setLocations] = useState<{id: number, name: string}[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [financialEntries, setFinancialEntries] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return;
      const currentScrollY = mainContentRef.current.scrollTop;
      
      // Only trigger collapse on screens below 1280px (xl)
      if (window.innerWidth < 1280) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          // Scrolling down - collapse
          setIsSidebarCollapsed(true);
          // Also close mobile drawer if it's open
          if (window.innerWidth < 1024 && isSidebarOpen) {
            setIsSidebarOpen(false);
          }
        } else if (currentScrollY < lastScrollY || currentScrollY <= 10) {
          // Scrolling up or at top - expand
          setIsSidebarCollapsed(false);
        }
      }
      setLastScrollY(currentScrollY);
    };

    const container = mainContentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollY, isSidebarOpen]);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [activeGenericMenuId, setActiveGenericMenuId] = useState<number | null>(null);
  const [genericMenuPosition, setGenericMenuPosition] = useState<{ top: number, left: number } | null>(null);

  const handleGenericMenuClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setGenericMenuPosition({ top: rect.bottom + window.scrollY, left: rect.right - 160 + window.scrollX });
    setActiveGenericMenuId(id);
  };

  useEffect(() => {
    fetchData();

    // WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ORDER_UPDATED' || data.type === 'INVENTORY_UPDATED' || data.type === 'AUDIT_LOG_UPDATED') {
        fetchData();
      }
    };

    return () => ws.close();
  }, []);

  const fetchData = async () => {
    try {
      const [
        statsData,
        productsData,
        ordersData,
        clientsData,
        suppliersData,
        assetsData,
        categoriesData,
        locationsData,
        movementsData,
        financialData,
        auditLogsData
      ] = await Promise.all([
        apiService.getStats(),
        apiService.getProducts(),
        apiService.getOrders(),
        apiService.getClients(),
        apiService.getSuppliers(),
        apiService.getAssets(),
        apiService.getCategories(),
        apiService.getLocations(),
        apiService.getMovements(),
        apiService.getFinancialEntries(),
        apiService.getAuditLogs()
      ]);

      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
      setClients(clientsData);
      setSuppliers(suppliersData);
      setAssets(assetsData);
      setCategories(categoriesData);
      setLocations(locationsData);
      setMovements(movementsData);
      setFinancialEntries(financialData);
      setAuditLogs(auditLogsData);
    } catch (err) {
      console.error('Error in fetchData:', err);
    }
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await apiService.patchOrder(id, { status });
      fetchData();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const addOrder = async (data: any) => {
    try {
      await apiService.addOrder(data);
      fetchData();
    } catch (err) {
      console.error('Error adding order:', err);
    }
  };

  const updateOrder = async (id: number, data: any) => {
    try {
      await apiService.updateOrder(id, data);
      fetchData();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de produção?')) return;
    try {
      await apiService.deleteOrder(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await apiService.deleteClient(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      await apiService.deleteSupplier(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  const deleteAsset = async (id: number) => {
    try {
      await apiService.deleteAsset(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  const addProduct = async (formData: FormData) => {
    try {
      await apiService.addProduct(formData);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar produto');
      console.error('Error adding product:', err);
    }
  };

  const addCategory = async (name: string) => {
    try {
      await apiService.addCategory(name);
      fetchData();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      await apiService.updateCategory(id, name);
      fetchData();
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const addSupplier = async (name: string) => {
    try {
      await apiService.addSupplier(name);
      fetchData();
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const addLocation = async (name: string) => {
    try {
      await apiService.addLocation(name);
      fetchData();
    } catch (err) {
      console.error('Error adding location:', err);
    }
  };

  const updateLocation = async (id: number, name: string) => {
    try {
      await apiService.updateLocation(id, name);
      fetchData();
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const handleStockIn = async (data: any) => {
    try {
      const submissionData = {
        ...data,
        invoice_pdf: data.invoices && data.invoices.length > 0 ? JSON.stringify(data.invoices) : ''
      };
      await apiService.stockIn(submissionData);
      fetchData();
    } catch (err) {
      console.error('Error in stock in:', err);
    }
  };

  const handleStockOut = async (data: any) => {
    try {
      await apiService.stockOut(data);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar saída');
      console.error('Error in stock out:', err);
    }
  };

  const handleUpdateProduct = async (id: number, formData: FormData) => {
    try {
      await apiService.updateProduct(id, formData);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar produto');
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await apiService.deleteProduct(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir produto');
      console.error('Error deleting product:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return (
        <Dashboard 
          stats={stats} 
          isDarkMode={isDarkMode} 
          onNavigate={(tab, search) => {
            setActiveTab(tab);
            if (search !== undefined) setInventorySearchTerm(search);
          }} 
        />
      );
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
          onUpdateCategory={updateCategory}
          onAddSupplier={addSupplier}
          onAddLocation={addLocation}
          onUpdateLocation={updateLocation}
          onStockIn={handleStockIn}
          onStockOut={handleStockOut}
          initialSearchTerm={inventorySearchTerm}
          onSearchTermChange={setInventorySearchTerm}
        />
      );
      case 'production': return (
        <GenericList 
          title="ORDENS DE PRODUÇÃO" 
          items={orders} 
          columns={[
            { key: 'id', label: 'ID', mono: true },
            { key: 'title', label: 'TÍTULO' },
            { key: 'status', label: 'STATUS' },
            { key: 'client_name', label: 'CLIENTE' }
          ]} 
          onAdd={() => {
            setEditingOrder(null);
            setIsOrderModalOpen(true);
          }}
          onItemClick={(order) => setSelectedOrderForDetail(order)}
        />
      );
      case 'kanban': return (
        <Kanban 
          orders={orders} 
          onUpdateStatus={updateOrderStatus} 
          onEdit={(order) => {
            setEditingOrder(order);
            setIsOrderModalOpen(true);
          }}
          onDelete={deleteOrder}
          onAdd={() => {
            setEditingOrder(null);
            setIsOrderModalOpen(true);
          }}
          onItemClick={(order) => setSelectedOrderForDetail(order)}
        />
      );
      case 'clients': return (
        <GenericList 
          title="CLIENTES" 
          items={clients} 
          columns={[
            { key: 'name', label: 'NOME' },
            { key: 'email', label: 'E-MAIL' },
            { key: 'phone', label: 'TELEFONE' }
          ]} 
        />
      );
      case 'suppliers': return (
        <GenericList 
          title="FORNECEDORES" 
          items={suppliers} 
          columns={[
            { key: 'name', label: 'NOME' },
            { key: 'contact', label: 'CONTATO' }
          ]} 
        />
      );
      case 'assets': return (
        <GenericList 
          title="PATRIMÔNIOS" 
          items={assets} 
          columns={[
            { key: 'name', label: 'NOME' },
            { key: 'code', label: 'CÓDIGO', mono: true },
            { key: 'status', label: 'STATUS' }
          ]} 
        />
      );
      case 'financial': return (
        <GenericList 
          title="FINANCEIRO (ENTRADAS DE ESTOQUE)" 
          showAddButton={false}
          showActions={false}
          items={financialEntries.map(e => ({
            ...e,
            total_value: `R$ ${(e.quantity * e.unit_price).toFixed(2)}`,
            unit_price_fmt: `R$ ${e.unit_price.toFixed(2)}`,
            issue_date_fmt: e.issue_date ? new Date(e.issue_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
            date_fmt: new Date(e.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          }))} 
          columns={[
            { key: 'issue_date_fmt', label: 'DATA EMISSÃO' },
            { key: 'date_fmt', label: 'DATA MOVIMENTO' },
            { key: 'doc_number', label: 'DOC. FISCAL' },
            { key: 'product_name', label: 'PRODUTO' },
            { key: 'quantity', label: 'QUANTIDADE' },
            { key: 'unit_price_fmt', label: 'V. UNITÁRIO' },
            { key: 'total_value', label: 'V. TOTAL' }
          ]} 
        />
      );
      case 'audit': return (
        <GenericList 
          title="HISTÓRICO DE AÇÕES NO SISTEMA" 
          showAddButton={false}
          showActions={false}
          items={auditLogs.map(l => ({
            ...l,
            created_at_fmt: new Date(l.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          }))} 
          columns={[
            { key: 'created_at_fmt', label: 'DATA/HORA' },
            { key: 'user_name', label: 'USUÁRIO' },
            { key: 'action', label: 'AÇÃO' },
            { key: 'details', label: 'DETALHES' }
          ]} 
        />
      );
      case 'settings': return <SettingsView />;
      default: return <div className="flex items-center justify-center h-64 text-zinc-400">Em desenvolvimento...</div>;
    }
  };

  return (
    <>
      <div id="portrait-warning">
        <div className="bg-zinc-800/50 p-6 rounded-3xl border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
            <RotateCcw className="text-zinc-900" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 uppercase">Gire seu dispositivo</h2>
          <p className="text-zinc-400 text-sm max-w-[240px] mx-auto leading-relaxed uppercase">
            Esta aplicação foi otimizada para visualização em modo <span className="text-white font-semibold">paisagem (deitado)</span> para oferecer a melhor experiência de gestão.
          </p>
        </div>
      </div>

      <div className="flex h-screen bg-white font-sans text-zinc-900 dark:bg-black dark:text-zinc-100 transition-colors duration-300">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-zinc-200 transition-all duration-300 lg:relative lg:translate-x-0 dark:bg-zinc-950 dark:border-zinc-800",
        isSidebarCollapsed ? "w-20" : "w-64",
        !isSidebarOpen && "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className={cn("p-6 flex items-center justify-between", isSidebarCollapsed && "px-0 justify-center")}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center dark:bg-zinc-100 flex-shrink-0">
                <Package className="text-white dark:text-zinc-900" size={20} />
              </div>
              {!isSidebarCollapsed && <span className="font-bold text-lg tracking-tight dark:text-white truncate">SkySmart</span>}
            </div>
            {!isSidebarCollapsed && (
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 dark:text-zinc-500">
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            <SidebarItem icon={LayoutDashboard} label="Painel" active={activeTab === 'dashboard'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={ClipboardList} label="Kanban" active={activeTab === 'kanban'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('kanban'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={FileText} label="Ordem de Produção" active={activeTab === 'production'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('production'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Users} label="Clientes" active={activeTab === 'clients'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Truck} label="Fornecedores" active={activeTab === 'suppliers'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('suppliers'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={HardDrive} label="Patrimônios" active={activeTab === 'assets'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('assets'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Package} label="Estoque" active={activeTab === 'inventory'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={DollarSign} label="Financeiro" active={activeTab === 'financial'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('financial'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Settings} label="Configurações" active={activeTab === 'settings'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={RotateCcw} label="Histórico" active={activeTab === 'audit'} isCollapsed={isSidebarCollapsed} onClick={() => { setActiveTab('audit'); setIsSidebarOpen(false); }} />
          </nav>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className={cn("flex items-center gap-3 px-2 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50", isSidebarCollapsed && "justify-center px-0")}>
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                AD
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate uppercase">Administrador</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">admin@pro.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 flex-shrink-0 dark:bg-zinc-950 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-zinc-400 dark:text-zinc-500">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {activeTab === 'dashboard' && 'PAINEL'}
              {activeTab === 'kanban' && 'KANBAN'}
              {activeTab === 'production' && 'ORDENS DE PRODUÇÃO'}
              {activeTab === 'clients' && 'CLIENTES'}
              {activeTab === 'suppliers' && 'FORNECEDORES'}
              {activeTab === 'assets' && 'PATRIMÔNIOS'}
              {activeTab === 'inventory' && 'ESTOQUE'}
              {activeTab === 'financial' && 'FINANCEIRO'}
              {activeTab === 'settings' && 'CONFIGURAÇÕES'}
              {activeTab === 'audit' && 'HISTÓRICO DE AÇÕES'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6" ref={mainContentRef}>
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

      <OrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSubmit={(data) => {
          if (editingOrder) {
            updateOrder(editingOrder.id, data);
          } else {
            addOrder(data);
          }
        }}
        editingOrder={editingOrder}
        clients={clients}
      />

      <OrderDetailModal 
        isOpen={!!selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        order={selectedOrderForDetail}
        onEdit={(order) => {
          setEditingOrder(order);
          setIsOrderModalOpen(true);
          setSelectedOrderForDetail(null);
        }}
        onDelete={deleteOrder}
      />

      <AnimatePresence>
        {activeGenericMenuId && genericMenuPosition && (
          <>
            <div className="fixed inset-0 z-[150]" onClick={() => setActiveGenericMenuId(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: genericMenuPosition.top, left: genericMenuPosition.left }}
              className="absolute w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-[160] overflow-hidden p-1"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTab === 'production') {
                    const item = orders.find(o => o.id === activeGenericMenuId);
                    if (item) {
                      setEditingOrder(item);
                      setIsOrderModalOpen(true);
                    }
                  }
                  // Handle other tabs here when modals are implemented
                  setActiveGenericMenuId(null);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                  activeTab === 'production' 
                    ? "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800" 
                    : "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                )}
                disabled={activeTab !== 'production'}
              >
                <Edit size={14} />
                Editar
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Tem certeza que deseja excluir este item?')) {
                    if (activeTab === 'production') deleteOrder(activeGenericMenuId);
                    else if (activeTab === 'clients') deleteClient(activeGenericMenuId);
                    else if (activeTab === 'suppliers') deleteSupplier(activeGenericMenuId);
                    else if (activeTab === 'assets') deleteAsset(activeGenericMenuId);
                  }
                  setActiveGenericMenuId(null);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
