import type { InvoiceStatus } from '@/types';

export function formatEGP(n: number): string {
  const rounded = Math.round(n);
  return `${rounded.toLocaleString('ar-EG')} ج.م`;
}

export function formatNum(n: number): string {
  return n.toLocaleString('ar-EG');
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const statusLabel: Record<InvoiceStatus, string> = {
  paid: 'مدفوعة',
  partial: 'جزئي',
  unpaid: 'آجل',
};

export const statusStyles: Record<InvoiceStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  partial: 'bg-amber-50 text-amber-700 ring-amber-200',
  unpaid: 'bg-rust-50 text-rust-700 ring-rust-200',
};

export const methodLabel: Record<string, string> = {
  cash: 'نقدي',
  transfer: 'تحويل بنكي',
  cheque: 'شيك',
};

export function genId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
