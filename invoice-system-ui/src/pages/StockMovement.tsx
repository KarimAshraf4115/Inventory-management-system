import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Badge } from '@/components/ui';
import { DataTable, SearchToolbar } from '@/components/DataTable';
import { formatNum, formatDate } from '@/utils';

const refLabel: Record<string, string> = {
  invoice: 'فاتورة',
  return: 'مرتجع',
  adjustment: 'تسوية',
};

export function StockMovementPage() {
  const { movements, items } = useStore();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const enriched = movements.map((m) => ({
      ...m,
      item: items.find((i) => i.id === m.itemId),
    }));
    const q = search.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter(
      (r) => r.item?.code.includes(q) || r.item?.name.toLowerCase().includes(q),
    );
  }, [movements, items, search]);

  const totalIn = movements
    .filter((m) => m.direction === 'in')
    .reduce((s, m) => s + m.qty, 0);
  const totalOut = movements
    .filter((m) => m.direction === 'out')
    .reduce((s, m) => s + m.qty, 0);

  return (
    <div>
      <PageHeader title="حركة المخزون" subtitle="سجل كامل لكل حركات دخول وخروج الأصناف" />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="إجمالي الداخل" value={formatNum(totalIn)} icon={ArrowDownLeft} tint="emerald" />
        <StatCard label="إجمالي الخارج" value={formatNum(totalOut)} icon={ArrowUpRight} tint="rust" />
        <StatCard label="صافي الحركة" value={formatNum(totalIn - totalOut)} icon={ArrowLeftRight} tint="navy" />
      </div>

      <SearchToolbar search={search} onSearch={setSearch} searchPlaceholder="بحث بكود أو اسم الصنف..." />

      <DataTable
        columns={[
          { key: 'code', header: 'كود الصنف', render: (r) => <span className="font-mono text-xs text-gray-500">{r.item?.code ?? '—'}</span> },
          { key: 'name', header: 'اسم الصنف', render: (r) => <span className="font-kufi text-ink">{r.item?.name ?? '—'}</span> },
          {
            key: 'direction',
            header: 'نوع الحركة',
            render: (r) =>
              r.direction === 'in' ? (
                <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <ArrowDownLeft size={11} /> داخل
                </Badge>
              ) : (
                <Badge className="bg-rust-50 text-rust-700 ring-rust-200">
                  <ArrowUpRight size={11} /> خارج
                </Badge>
              ),
          },
          {
            key: 'ref',
            header: 'المرجع',
            render: (r) => (
              <span className="text-xs text-gray-500">
                {refLabel[r.refType]} #{r.refId.replace(/\D/g, '')}
              </span>
            ),
          },
          { key: 'qty', header: 'الكمية', render: (r) => <span className={`font-kufi font-bold ${r.direction === 'in' ? 'text-emerald-600' : 'text-rust-600'}`}>{r.direction === 'in' ? '+' : '−'}{formatNum(r.qty)}</span> },
          { key: 'date', header: 'التاريخ', render: (r) => <span className="text-gray-500">{formatDate(r.date)}</span> },
        ]}
        rows={rows}
        empty="لا توجد حركات مخزون"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  icon: typeof ArrowDownLeft;
  tint: 'emerald' | 'rust' | 'navy';
}) {
  const tints = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rust: 'bg-rust-50 text-rust-600',
    navy: 'bg-navy-50 text-navy-600',
  };
  return (
    <div className="rounded-xl2 border border-line bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tints[tint]}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="font-kufi text-xs font-medium text-gray-500">{label}</p>
          <p className="font-kufi text-lg font-bold text-ink">{value}</p>
        </div>
      </div>
    </div>
  );
}
