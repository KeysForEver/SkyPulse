import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Movement } from '../types';
import { maskValue, formatCurrency } from '../lib/valueMask';

export const exportToCSV = (products: Product[], canSeeValues = false) => {
  const headers = ['ID', 'Nome', 'Categoria', 'Estoque', 'Unidade', 'Preço de Custo', 'Estoque Mínimo', 'Status'];
  const rows = products.map(p => [
    p.id,
    p.name,
    p.category,
    p.quantity,
    p.unit,
    formatCurrency(p.cost_price, canSeeValues),
    p.min_quantity !== null ? p.min_quantity : '-',
    (p.min_quantity !== null && p.quantity <= p.min_quantity) ? 'Estoque Baixo' : 'Normal'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `estoque_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (products: Product[], selectedFields: string[], includeTotalValue: boolean, canSeeValues = false) => {
  const doc = new jsPDF();
  
  const fieldLabels: Record<string, string> = {
    id: 'ID',
    name: 'Nome',
    category: 'Categoria',
    quantity: 'Estoque',
    unit: 'Unidade',
    cost_price: 'V. Unitário',
    min_quantity: 'Mínimo',
    status: 'Status',
    total_value: 'V. Total'
  };

  const activeFields = [...selectedFields];
  if (includeTotalValue && !activeFields.includes('total_value')) {
    activeFields.push('total_value');
  }

  const tableColumn = activeFields.map(field => fieldLabels[field] || field);
  
  const tableRows = products.map(p => {
    return activeFields.map(field => {
      if (field === 'cost_price') return formatCurrency(p.cost_price, canSeeValues);
      if (field === 'total_value') return formatCurrency(p.quantity * p.cost_price, canSeeValues);
      if (field === 'quantity') return p.quantity;
      if (field === 'min_quantity') return p.min_quantity !== null ? p.min_quantity : '-';
      if (field === 'status') return (p.min_quantity !== null && p.quantity <= p.min_quantity) ? 'Estoque Baixo' : 'Normal';
      return (p as any)[field] ?? '-';
    });
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
  });

  doc.setFontSize(14);
  doc.text('Relatório de Estoque', 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 21);
  
  doc.save(`estoque_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportMovementsToPDF = (movements: Movement[], canSeeValues = false) => {
  const doc = new jsPDF();
  const tableColumn = ['Data', 'Tipo', 'Produto', 'Qtd', 'Origem/Destino', 'Doc/Motivo'];
  const tableRows = movements.map(m => {
    const date = new Date(m.date).toLocaleString('pt-BR');
    const type = m.type === 'IN' ? 'ENTRADA' : 'SAÍDA';
    const origin = m.type === 'IN' ? (m.supplier_name || m.location) : m.destination;
    const docVal = m.type === 'IN' ? m.doc_number : m.reason;
    return [date, type, m.product_name, m.quantity, origin, docVal];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
  });

  doc.text('Relatório de Movimentações de Estoque', 14, 15);
  doc.save(`movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportMovementsToCSV = (movements: Movement[], canSeeValues = false) => {
  const headers = "Data,Tipo,Produto,Quantidade,Origem/Destino,Documento/Motivo\n";
  const rows = movements.map(m => {
    const date = new Date(m.date).toLocaleString('pt-BR');
    const type = m.type === 'IN' ? 'ENTRADA' : 'SAÍDA';
    const origin = m.type === 'IN' ? (m.supplier_name || m.location) : m.destination;
    const doc = m.type === 'IN' ? m.doc_number : m.reason;
    return `"${date}","${type}","${m.product_name}","${m.quantity}","${origin}","${doc}"`;
  }).join("\n");
  
  const csvContent = headers + rows;
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `movimentacoes_estoque_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportGenericToCSV = (data: any[], columns: { key: string, label: string }[], filename: string) => {
  const headers = columns.map(col => col.label);
  const rows = data.map(item => columns.map(col => item[col.key] ?? '-'));

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportGenericToPDF = (data: any[], columns: { key: string, label: string }[], title: string, filename: string) => {
  const doc = new jsPDF();
  const tableColumn = columns.map(col => col.label);
  const tableRows = data.map(item => columns.map(col => item[col.key] ?? '-'));

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [24, 24, 27], textColor: [255, 255, 255] },
  });

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 21);
  
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export interface MaterialExportItem {
  descricao: string;
  preco_medio: number;
  id?: string | number;
  codigo?: string | number;
  nome?: string;
  name?: string;
  categoria?: string;
  category?: string;
  unidade?: string;
  unit?: string;
  quantidade_estoque?: number;
  quantity?: number;
  estoque_minimo?: number | null;
  min_quantity?: number | null;
  status?: 'Normal' | 'Estoque Baixo';
  preco_custo_base?: number;
  cost_price?: number;
  valor_unitario_medio?: number; // Campo solicitado: Valor Unitário (Média)
  average_unit_price?: number;
  valor_unitario_medio_ponderado?: number;
  weighted_average_unit_price?: number;
  valor_total_estoque?: number;
  total_value?: number;
  entradas_consideradas?: number;
  ultimo_fornecedor?: string;
  last_supplier?: string;
  atualizado_em?: string;
}

export const computeMaterialExportData = (
  products: Product[],
  movements: Movement[] = []
): MaterialExportItem[] => {
  const now = new Date().toISOString();

  return products.map(product => {
    // Entradas do tipo 'IN' com preço unitário > 0 deste produto
    const inMovements = (movements || []).filter(m => 
      (m.product_id === product.id || String(m.product_id) === String(product.id)) &&
      m.type === 'IN' &&
      Number(m.unit_price || 0) > 0
    );

    // Média aritmética simples das entradas (mesma fórmula usada nos detalhes do produto)
    const avgSimple = inMovements.length > 0
      ? inMovements.reduce((sum, m) => sum + Number(m.unit_price || 0), 0) / inMovements.length
      : Number(product.cost_price || 0);

    // Média ponderada pela quantidade de entrada
    const totalInQty = inMovements.reduce((sum, m) => sum + Number(m.quantity || 0), 0);
    const totalInCost = inMovements.reduce((sum, m) => sum + (Number(m.quantity || 0) * Number(m.unit_price || 0)), 0);
    const weightedAvg = totalInQty > 0 ? (totalInCost / totalInQty) : Number(product.cost_price || 0);

    const valorUnitarioMedio = Number(avgSimple.toFixed(2));
    const valorPonderado = Number(weightedAvg.toFixed(2));
    const precoCusto = Number((product.cost_price || 0).toFixed(2));
    const totalEstoque = Number(((product.quantity || 0) * valorUnitarioMedio).toFixed(2));
    const isLow = product.min_quantity !== null && (product.quantity || 0) <= product.min_quantity;

    return {
      descricao: product.name,
      preco_medio: valorUnitarioMedio,
      id: product.id,
      codigo: product.id,
      nome: product.name,
      name: product.name,
      categoria: product.category,
      category: product.category,
      unidade: product.unit,
      unit: product.unit,
      quantidade_estoque: product.quantity || 0,
      quantity: product.quantity || 0,
      estoque_minimo: product.min_quantity,
      min_quantity: product.min_quantity,
      status: isLow ? 'Estoque Baixo' : 'Normal',
      preco_custo_base: precoCusto,
      cost_price: precoCusto,
      valor_unitario_medio: valorUnitarioMedio,
      average_unit_price: valorUnitarioMedio,
      valor_unitario_medio_ponderado: valorPonderado,
      weighted_average_unit_price: valorPonderado,
      valor_total_estoque: totalEstoque,
      total_value: totalEstoque,
      entradas_consideradas: inMovements.length,
      ultimo_fornecedor: product.last_supplier,
      last_supplier: product.last_supplier,
      atualizado_em: now
    };
  });
};

export const exportToJSON = (products: Product[], movements: Movement[] = []) => {
  const exportData = computeMaterialExportData(products, movements);
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `estoque_materiais_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return exportData;
};

export const syncMaterialsToApi = async (products: Product[], movements: Movement[] = []) => {
  const exportData = computeMaterialExportData(products, movements);
  try {
    const res = await fetch('/api/inventory/sync-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportData)
    });
    if (!res.ok) {
      throw new Error(`Falha ao sincronizar: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Erro na sincronização de materiais:', error);
    throw error;
  }
};

