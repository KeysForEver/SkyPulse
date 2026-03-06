import React, { useState } from 'react';
import { Download, ShieldCheck, Database as DbIcon, Loader2 } from 'lucide-react';
import { Card } from './Common';
import { motion } from 'motion/react';

export const Settings = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch('/api/backup');
      if (!response.ok) throw new Error('Falha ao baixar backup');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `backup_skysmart_${date}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro no backup:', error);
      alert('Erro ao realizar backup do banco de dados.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight uppercase">Configurações</h2>
        <p className="text-zinc-500 dark:text-zinc-400 uppercase">Gerencie as preferências e segurança do sistema.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center flex-shrink-0">
              <DbIcon className="text-zinc-900 dark:text-zinc-100" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1 uppercase">Backup do Banco de Dados</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 uppercase">
                Baixe uma cópia completa do banco de dados em formato comprimido (.zip). 
              </p>
              
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isBackingUp ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Download size={18} />
                )}
                {isBackingUp ? 'GERANDO BACKUP...' : 'BAIXAR BACKUP (.ZIP)'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
