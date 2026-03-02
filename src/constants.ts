import { OrderStatus } from './types';

export const KANBAN_COLUMNS: OrderStatus[] = [
  'Ordens de Produção',
  'Separação de Material',
  'Produção',
  'Finalização',
  'Revisão'
];

export const ROLES = ['Admin', 'Almoxarifado', 'Vendas', 'Instalação'];
