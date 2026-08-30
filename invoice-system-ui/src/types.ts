export type InvoiceType = 'sale' | 'purchase';
export type PaymentMethod = 'cash' | 'transfer' | 'cheque';
export type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

export interface Item {
  id: string;
  code: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minQuantity: number;
}

export interface Party {
  id: string;
  name: string;
  phone: string;
  balance: number; // positive = we owe them (credit) / they owe us; sign convention handled per screen
  type?: string; // for suppliers: مصنع / مكتب
}

export interface InvoiceLine {
  id: string;
  itemId: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  partyId: string;
  date: string; // ISO
  lines: InvoiceLine[];
  notes?: string;
  initialPaid: number;
  partyName?: string;
  total?: number;
  paid?: number;
  remaining?: number;
  status?: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  notes?: string;
}

export interface ReturnRecord {
  id: string;
  number: string;
  originalInvoiceId: string;
  date: string;
  reason: string;
  lines: { itemId: string; qty: number; price: number }[];
}

export interface Expense {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  direction: 'in' | 'out';
  refType: 'invoice' | 'return' | 'adjustment';
  refId: string;
  qty: number;
  date: string;
}

export type PageKey =
  | 'dashboard'
  | 'items'
  | 'customers'
  | 'suppliers'
  | 'invoices'
  | 'new-invoice'
  | 'payments'
  | 'returns'
  | 'expenses'
  | 'stock';
