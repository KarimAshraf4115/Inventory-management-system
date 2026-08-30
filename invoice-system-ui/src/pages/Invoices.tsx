import { useMemo, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useStore } from '@/store';
import { Button, PageHeader, Badge } from '@/components/ui';
import { DataTable, SearchToolbar } from '@/components/DataTable';
import { formatEGP, formatDate, statusLabel, statusStyles } from '@/utils';
import type { InvoiceType, PageKey } from '@/types';

interface Props {
  onNavigate: (p: PageKey) => void;
}

export function InvoicesPage({ onNavigate }: Props) {
  const { invoices } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const partyName = (inv: { partyName?: string }) => inv.partyName ?? '—';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (typeFilter !== 'all' && inv.type !== typeFilter) return false;
      if (from && inv.date < from) return false;
      if (to && inv.date > to) return false;
      if (q && !inv.number.includes(q) && !partyName(inv).toLowerCase().includes(q))
        return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, search, typeFilter, from, to]);

  return (
    <div>
      <PageHeader
        title="الفواتير"
        subtitle={`${invoices.length} فاتورة`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => onNavigate('new-invoice')}>
            فاتورة جديدة
          </Button>
        }
      />

      <SearchToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="بحث برقم الفاتورة أو اسم الطرف..."
      >
        <select
          className="input-base w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as InvoiceType | 'all')}
        >
          <option value="all">كل الأنواع</option>
          <option value="sale">بيع</option>
          <option value="purchase">شراء</option>
        </select>
        <input
          type="date"
          className="input-base w-auto"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          title="من تاريخ"
        />
        <input
          type="date"
          className="input-base w-auto"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          title="إلى تاريخ"
        />
      </SearchToolbar>

      <DataTable
        columns={[
          {
            key: 'number',
            header: 'رقم الفاتورة',
            render: (inv) => (
              <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-navy-600">
                <FileText size={13} /> #{inv.number}
              </span>
            ),
          },
          {
            key: 'type',
            header: 'النوع',
            render: (inv) => (
              <Badge
                className={
                  inv.type === 'sale'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : 'bg-navy-50 text-navy-700 ring-navy-200'
                }
              >
                {inv.type === 'sale' ? 'بيع' : 'شراء'}
              </Badge>
            ),
          },
          { key: 'party', header: 'الطرف', render: (inv) => <span className="font-kufi text-ink">{partyName(inv)}</span> },
          { key: 'date', header: 'التاريخ', render: (inv) => <span className="text-gray-500">{formatDate(inv.date)}</span> },
          { key: 'total', header: 'الإجمالي', render: (inv) => <span className="font-kufi font-bold text-ink">{formatEGP(inv.total ?? 0)}</span> },
          { key: 'paid', header: 'المدفوع', render: (inv) => <span className="text-emerald-600">{formatEGP(inv.paid ?? 0)}</span> },
          { key: 'remaining', header: 'المتبقي', render: (inv) => <span className="text-rust-600">{formatEGP(inv.remaining ?? 0)}</span> },
          {
            key: 'status',
            header: 'الحالة',
            render: (inv) => (
              <Badge className={statusStyles[inv.status ?? 'unpaid']}>
                {statusLabel[inv.status ?? 'unpaid']}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'إجراءات',
            render: (inv) => (
              <Button
                size="sm"
                variant="subtle"
                onClick={() => onNavigate('payments')}
              >
                مدفوعات
              </Button>
            ),
          },
        ]}
        rows={filtered}
        empty="لا توجد فواتير مطابقة"
      />
    </div>
  );
}