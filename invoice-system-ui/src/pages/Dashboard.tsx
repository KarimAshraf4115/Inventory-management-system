import {
  TrendingUp,
  Boxes,
  AlertTriangle,
  Wallet,
  ArrowLeft,
  FileText,
  Users,
  Truck,
  Undo2,
  Receipt,
  ArrowLeftRight,
  PlusCircle,
  type LucideIcon,
} from 'lucide-react';
import { useStore, invoiceRemaining, invoiceTotal } from '@/store';
import { formatEGP, formatNum } from '@/utils';
import type { PageKey } from '@/types';

interface Props {
  onNavigate: (p: PageKey) => void;
}

export function Dashboard({ onNavigate }: Props) {
  const { items, customers, suppliers, invoices, payments, dashboardSummary } = useStore();

  const lowStock = items.filter((it) => it.quantity <= it.minQuantity);

  const todaySales = dashboardSummary?.todaysSales ?? 0;
  const inventoryValue = dashboardSummary?.stockValue ?? 0;
  const outstanding = dashboardSummary?.totalReceivable ?? 0;

  const cards = [
    {
      label: 'مبيعات اليوم',
      value: formatEGP(todaySales),
      icon: TrendingUp,
      tint: 'navy',
    },
    {
      label: 'قيمة المخزون الحالية',
      value: formatEGP(inventoryValue),
      icon: Boxes,
      tint: 'emerald',
    },
    {
      label: 'أصناف تحت الحد الأدنى',
      value: `${formatNum(lowStock.length)} صنف`,
      icon: AlertTriangle,
      tint: 'rust',
      alert: true,
    },
    {
      label: 'إجمالي مستحق على العملاء',
      value: formatEGP(outstanding),
      icon: Wallet,
      tint: 'amber',
    },
  ];

  const quick: { key: PageKey; label: string; icon: LucideIcon; desc: string }[] = [
    { key: 'new-invoice', label: 'فاتورة جديدة', icon: PlusCircle, desc: 'إنشاء فاتورة بيع أو شراء' },
    { key: 'items', label: 'الأصناف', icon: Boxes, desc: 'إدارة المخزون والأسعار' },
    { key: 'customers', label: 'العملاء', icon: Users, desc: 'حسابات وأرصدة العملاء' },
    { key: 'suppliers', label: 'الموردين', icon: Truck, desc: 'إدارة الموردين والمشتريات' },
    { key: 'invoices', label: 'الفواتير', icon: FileText, desc: 'كل الفواتير والبحث' },
    { key: 'payments', label: 'المدفوعات', icon: Wallet, desc: 'تسجيل دفعات العملاء' },
    { key: 'returns', label: 'المرتجعات', icon: Undo2, desc: 'مرتجعات البيع والشراء' },
    { key: 'expenses', label: 'المصروفات', icon: Receipt, desc: 'مصروفات التشغيل' },
    { key: 'stock', label: 'حركة المخزون', icon: ArrowLeftRight, desc: 'سجل حركة الأصناف' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-kufi text-2xl font-bold text-gray-900 dark:text-slate-100">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">نظرة عامة على أداء المتجر اليوم</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const tints: Record<string, string> = {
            navy: 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
            rust: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
          };
          return (
            <div
              key={c.label}
              className={`rounded-xl border bg-white p-5 shadow-sm transition dark:bg-slate-900 dark:border-slate-800 ${
                c.alert ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-kufi text-sm font-medium text-gray-600 dark:text-slate-400">{c.label}</p>
                  <p className="mt-2 font-kufi text-2xl font-bold text-gray-900 dark:text-slate-100">{c.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tints[c.tint]}`}>
                  <Icon size={20} />
                </div>
              </div>
              {c.alert && lowStock.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle size={13} />
                  <span className="font-kufi">
                    {lowStock.slice(0, 2).map((i) => i.name).join('، ')}
                    {lowStock.length > 2 && ` و${lowStock.length - 2} أخرى`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick access grid */}
      <div>
        <h2 className="mb-3 font-kufi text-base font-bold text-gray-900 dark:text-slate-100">شبكة الوصول السريع</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.key}
                onClick={() => onNavigate(q.key)}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-right shadow-sm transition hover:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-kufi text-sm font-semibold text-gray-900 dark:text-slate-100">{q.label}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-slate-400">{q.desc}</p>
                </div>
                <ArrowLeft size={16} className="text-gray-400 transition group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-emerald-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-kufi text-base font-bold text-gray-900 dark:text-slate-100">أحدث الفواتير</h2>
          <button
            onClick={() => onNavigate('invoices')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            عرض الكل <ArrowLeft size={14} />
          </button>
        </div>
        <div className="space-y-2.5">
          {invoices.slice(0, 4).map((inv) => {
            const party =
              inv.type === 'sale'
                ? customers.find((c) => c.id === inv.partyId)
                : suppliers.find((s) => s.id === inv.partyId);
            return (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400 dark:text-slate-500">#{inv.number}</span>
                  <div>
                    <p className="font-kufi text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {party?.name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {inv.type === 'sale' ? 'فاتورة بيع' : 'فاتورة شراء'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-kufi text-sm font-bold text-gray-900 dark:text-slate-100">
                    {formatEGP(invoiceTotal(inv))}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    متبقي {formatEGP(invoiceRemaining(inv, payments))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}