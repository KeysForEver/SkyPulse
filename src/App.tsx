import React, { useState, useEffect } from 'react';
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
  Sun, 
  Moon, 
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Client, Supplier, Asset, Order, Movement, OrderStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Kanban } from './components/Kanban';
import { GenericList } from './components/GenericList';
import { Settings as SettingsView } from './components/Settings';
import { SidebarItem, cn } from './components/Common';

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
        { key: 'financial', url: '/api/financial/entries', setter: setFinancialEntries },
        { key: 'audit-logs', url: '/api/audit-logs', setter: setAuditLogs },
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

  const addProduct = async (formData: FormData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData
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

  const updateCategory = async (id: number, name: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating category:', err);
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

  const updateLocation = async (id: number, name: string) => {
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating location:', err);
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

  const handleUpdateProduct = async (id: number, formData: FormData) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        body: formData
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
          onUpdateCategory={updateCategory}
          onAddSupplier={addSupplier}
          onAddLocation={addLocation}
          onUpdateLocation={updateLocation}
          onStockIn={handleStockIn}
          onStockOut={handleStockOut}
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
        />
      );
      case 'kanban': return <Kanban orders={orders} onUpdateStatus={updateOrderStatus} />;
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
          items={financialEntries.map(e => ({
            ...e,
            total_value: `R$ ${(e.quantity * e.unit_price).toFixed(2)}`,
            unit_price_fmt: `R$ ${e.unit_price.toFixed(2)}`,
            issue_date_fmt: e.issue_date ? new Date(e.issue_date).toLocaleDateString('pt-BR') : '-'
          }))} 
          columns={[
            { key: 'issue_date_fmt', label: 'DATA EMISSÃO' },
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
            created_at_fmt: new Date(l.created_at).toLocaleString('pt-BR')
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

      <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

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
              <span className="font-bold text-lg tracking-tight dark:text-white">SkySmart</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 dark:text-zinc-500">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarItem icon={LayoutDashboard} label="Painel" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={ClipboardList} label="Kanban" active={activeTab === 'kanban'} onClick={() => { setActiveTab('kanban'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={FileText} label="Ordem de Produção" active={activeTab === 'production'} onClick={() => { setActiveTab('production'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Users} label="Clientes" active={activeTab === 'clients'} onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Truck} label="Fornecedores" active={activeTab === 'suppliers'} onClick={() => { setActiveTab('suppliers'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={HardDrive} label="Patrimônios" active={activeTab === 'assets'} onClick={() => { setActiveTab('assets'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Package} label="Estoque" active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={DollarSign} label="Financeiro" active={activeTab === 'financial'} onClick={() => { setActiveTab('financial'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={RotateCcw} label="Histórico" active={activeTab === 'audit'} onClick={() => { setActiveTab('audit'); setIsSidebarOpen(false); }} />
          </nav>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate uppercase">Administrador</p>
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
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors"
              title={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">
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
    </>
  );
}
