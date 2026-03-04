import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ClipboardList, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Movement } from '../types';
import { Card, StatCard, cn } from './Common';

interface DashboardProps {
  stats: any;
  isDarkMode: boolean;
}

export const Dashboard = ({ stats, isDarkMode }: DashboardProps) => {
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
