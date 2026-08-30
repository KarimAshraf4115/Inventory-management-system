import {
  LayoutDashboard,
  Boxes,
  Users,
  Truck,
  FileText,
  Wallet,
  Undo2,
  Receipt,
  ArrowLeftRight,
  PlusCircle,
  type LucideIcon,
} from 'lucide-react';
import type { PageKey } from '@/types';

interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { key: 'items', label: 'الأصناف', icon: Boxes },
  { key: 'customers', label: 'العملاء', icon: Users },
  { key: 'suppliers', label: 'الموردين', icon: Truck },
  { key: 'invoices', label: 'الفواتير', icon: FileText },
  { key: 'new-invoice', label: 'فاتورة جديدة', icon: PlusCircle },
  { key: 'payments', label: 'المدفوعات', icon: Wallet },
  { key: 'returns', label: 'المرتجعات', icon: Undo2 },
  { key: 'expenses', label: 'المصروفات', icon: Receipt },
  { key: 'stock', label: 'حركة المخزون', icon: ArrowLeftRight },
];
