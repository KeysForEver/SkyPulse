import { OrderStatus } from './types';

export const KANBAN_COLUMNS: OrderStatus[] = [
  'ORDENS DE PRODUÇÃO',
  'SEPARAÇÃO DE MATERIAL',
  'PRODUÇÃO',
  'FINALIZAÇÃO',
  'REVISÃO'
];

export const ROLES = ['Admin', 'Almoxarifado', 'Vendas', 'Instalação'];
