export type Role = 'Admin' | 'Almoxarifado' | 'Vendas' | 'Instalação';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  cost_price: number;
  quantity: number;
  min_quantity: number | null;
  photo?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
}

export interface Asset {
  id: number;
  name: string;
  code: string;
  status: string;
}

export type OrderStatus = 'Ordens de Produção' | 'Separação de Material' | 'Produção' | 'Finalização' | 'Revisão';

export interface Order {
  id: number;
  title: string;
  description: string;
  status: OrderStatus;
  client_id: number;
  client_name?: string;
  created_at: string;
}

export interface Movement {
  id: number;
  product_id: number;
  product_name?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  supplier_id?: number;
  supplier_name?: string;
  doc_number?: string;
  issue_date?: string;
  location?: string;
  unit_price?: number;
  reason?: string;
  destination?: string;
}
