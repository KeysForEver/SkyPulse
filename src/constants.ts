import { OrderStatus } from './types';

export const KANBAN_COLUMNS: OrderStatus[] = [
  'ENTRADA DE SERVIÇO',
  'ORDENS DE PRODUÇÃO',
  'SEPARAÇÃO DE MATERIAL',
  'PRODUÇÃO',
  'FINALIZAÇÃO',
  'REVISÃO',
  'CONCLUIDO'
];

export const ROLES = ['Admin', 'Almoxarifado', 'Vendas', 'Instalação'];
