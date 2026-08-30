import { useMemo, useState } from 'react';
import { Plus, Pencil, History, AlertTriangle, Trash2 } from 'lucide-react';
import { useStore } from '@/store';
import { Button, Field, PageHeader, Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { DataTable, SearchToolbar } from '@/components/DataTable';
import { formatEGP, formatNum } from '@/utils';
import type { Item } from '@/types';

const empty: Omit<Item, 'id'> = {
  code: '',
  name: '',
  purchasePrice: 0,
  sellingPrice: 0,
  quantity: 0,
  minQuantity: 1,
};

export function ItemsPage({ onNavigate }: { onNavigate: (p: 'stock') => void }) {
  const { items, addItem, updateItem, deleteItem } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Omit<Item, 'id'>>(empty);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return items;
    return items.filter(
      (it) => it.code.includes(q) || it.name.toLowerCase().includes(q.toLowerCase()),
    );
  }, [items, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...empty, code: String(Math.floor(1000 + Math.random() * 9000)) });
    setModalOpen(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setForm({ ...it });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateItem(editing.id, form);
    else addItem(form);
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="الأصناف"
        subtitle={`${items.length} صنف في المخزون`}
        action={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            إضافة صنف
          </Button>
        }
      />

      <SearchToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="بحث بالكود أو الاسم..."
      />

      <DataTable<Item>
        columns={[
          {
            key: 'code',
            header: 'الكود',
            render: (it) => <span className="font-mono text-xs text-gray-500">{it.code}</span>,
          },
          { key: 'name', header: 'الاسم', render: (it) => <span className="font-kufi font-semibold text-ink">{it.name}</span> },
          { key: 'purchase', header: 'سعر الشراء', render: (it) => <span className="text-gray-600">{formatEGP(it.purchasePrice)}</span> },
          { key: 'sell', header: 'سعر البيع', render: (it) => <span className="text-gray-600">{formatEGP(it.sellingPrice)}</span> },
          {
            key: 'qty',
            header: 'الكمية الحالية',
            render: (it) => {
              const low = it.quantity <= it.minQuantity;
              return (
                <div className="flex items-center gap-2">
                  <span className={`font-kufi font-bold ${low ? 'text-rust-600' : 'text-ink'}`}>
                    {formatNum(it.quantity)}
                  </span>
                  {low && (
                    <Badge className="bg-rust-50 text-rust-700 ring-rust-200">
                      <AlertTriangle size={11} /> تحت الحد الأدنى
                    </Badge>
                  )}
                </div>
              );
            },
          },
          {
            key: 'actions',
            header: 'إجراءات',
            render: (it) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(it)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-navy-50 hover:text-navy-600"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onNavigate('stock')}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-navy-50 hover:text-navy-600"
                  title="السجل"
                >
                  <History size={16} />
                </button>
                <button
                  onClick={() => confirmDelete(it)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        rows={filtered}
        empty="لا توجد أصناف مطابقة"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'تعديل صنف' : 'إضافة صنف جديد'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الكود">
            <input
              className="input-base font-mono"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </Field>
          <Field label="اسم الصنف">
            <input
              className="input-base font-kufi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: قميص قطن أبيض"
            />
          </Field>
          <Field label="سعر الشراء (ج.م)">
            <input
              type="number"
              className="input-base"
              value={form.purchasePrice || ''}
              onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
            />
          </Field>
          <Field label="سعر البيع (ج.م)">
            <input
              type="number"
              className="input-base"
              value={form.sellingPrice || ''}
              onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
            />
          </Field>
          <Field label="الكمية الحالية">
            <input
              type="number"
              className="input-base"
              value={form.quantity || ''}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </Field>
          <Field label="الحد الأدنى للتنبيه">
            <input
              type="number"
              className="input-base"
              value={form.minQuantity || ''}
              onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );

  function confirmDelete(it: Item) {
    if (window.confirm(`حذف الصنف "${it.name}"؟`)) deleteItem(it.id);
  }
}
