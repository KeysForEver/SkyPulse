import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ClipboardList, 
  Users 
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
import { Card, StatCard } from './Common';

interface DashboardProps {
  stats: any;
  isDarkMode: boolean;
}

export const Dashboard = ({ stats, isDarkMode }: DashboardProps) => {
  const chartData = [
    { name: 'SEG', v: 400 },
    { name: 'TER', v: 300 },
    { name: 'QUA', v: 600 },
    { name: 'QUI', v: 800 },
    { name: 'SEX', v: 500 },
  ];

  const textColor = isDarkMode ? '#a1a1aa' : '#71717a';
  const gridColor = isDarkMode ? '#27272a' : '#f1f1f1';
  const barColor = isDarkMode ? '#f4f4f5' : '#18181b';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL PRODUTOS" value={stats?.totalProducts || 0} icon={Package} color="bg-blue-500" />
        <StatCard label="ESTOQUE BAIXO" value={stats?.lowStock || 0} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard label="ORDENS ATIVAS" value={stats?.activeOrders || 0} icon={ClipboardList} color="bg-indigo-500" />
        <StatCard label="CLIENTES" value={12} icon={Users} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card title="MOVIMENTAÇÕES DE ESTOQUE">
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
      </div>
    </div>
  );
};
