import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
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
    {label.toUpperCase()}
  </button>
);

export const Card = ({ children, className, title, onClick }: { children: React.ReactNode, className?: string, title?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn("bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800", className)}
  >
    {title && (
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title.toUpperCase()}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export const StatCard = ({ label, value, icon: Icon, trend, color, onClick }: { label: string, value: string | number, icon: any, trend?: string, color: string, onClick?: () => void }) => (
  <Card 
    className={cn("flex flex-col gap-1 transition-all", onClick && "cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.98]")}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">{label.toUpperCase()}</span>
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
