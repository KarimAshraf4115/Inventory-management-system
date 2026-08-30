import { useMemo, useState } from 'react';
import { Plus, Trash2, Search, AlertTriangle, Printer, Save, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store';
import { Button, Field, PageHeader } from '@/components/ui';
import { formatEGP, formatNum, todayISO, genId } from '@/utils';
import type { InvoiceType, InvoiceLine, PageKey } from '@/types';

interface Props {
  onNavigate: (p: PageKey) => void;
}

export function NewInvoicePage({ onNavigate }: Props) {
  const { items, customers, suppliers, addInvoice } = useStore();

  const [type, setType] = useState<InvoiceType>('sale');
  const [partyId, setPartyId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: genId('l'), itemId: '', qty: 1, price: 0 },
  ]);
  const [initialPaid, setInitialPaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [openItemFor, setOpenItemFor] = useState<string | null>(null);
  const [itemQuery, setItemQuery] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  const partyList = type === 'sale' ? customers : suppliers;
  const partyLabel = type === 'sale' ? 'العميل' : 'المورد';

  const filteredItems = useMemo(() => {
    const q = itemQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.code.includes(q) || it.name.toLowerCase().includes(q),
    );
  }, [items, itemQuery]);

  const grandTotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const remaining = grandTotal - initialPaid;
  const itemCount = lines.filter((l) => l.itemId).length;

  const setLine = (id: string, patch: Partial<InvoiceLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const addRow = () =>
    setLines((prev) => [...prev, { id: genId('l'), itemId: '', qty: 1, price: 0 }]);

  const removeRow = (id: string) =>
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((l) => l.id !== id)));

  const selectItem = (lineId: string, itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return;
    const price = type === 'sale' ? it.sellingPrice : it.purchasePrice;
    setLine(lineId, { itemId, price });
    setOpenItemFor(null);
    setItemQuery('');
  };

  const switchType = (t: InvoiceType) => {
    setType(t);
    setPartyId('');
    // re-price existing lines
    setLines((prev) =>
      prev.map((l) => {
        if (!l.itemId) return l;
        const it = items.find((i) => i.id === l.itemId);
        if (!it) return l;
        return { ...l, price: t === 'sale' ? it.sellingPrice : it.purchasePrice };
      }),
    );
  };

  const save = async (print: boolean) => {
    const validLines = lines.filter((l) => l.itemId && l.qty > 0);
    if (!validLines.length || !partyId) {
      window.alert('برجاء اختيار الطرف وإضافة صنف واحد على الأقل');
      return;
    }
    try {
      const inv = await addInvoice({
        type,
        partyId,
        date,
        lines: validLines,
        notes,
        initialPaid,
      });
      setSaved(inv.number);
      if (print) window.print();
    } catch (err: any) {
      window.alert(err.message || 'حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  if (saved) {
    return (
      <div className="mx-auto max-w-md rounded-xl2 border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Save size={26} />
        </div>
        <h2 className="font-kufi text-lg font-bold text-ink">تم حفظ الفاتورة بنجاح</h2>
        <p className="mt-1 text-sm text-gray-500">
          رقم الفاتورة: <span className="font-mono font-semibold text-navy-600">#{saved}</span>
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => onNavigate('invoices')}>
            عرض الفواتير
          </Button>
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setSaved(null);
              setPartyId('');
              setLines([{ id: genId('l'), itemId: '', qty: 1, price: 0 }]);
              setInitialPaid(0);
              setNotes('');
            }}
          >
            فاتورة جديدة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="فاتورة جديدة"
        subtitle="إنشاء فاتورة بيع أو شراء مع حساب لحظي للمبالغ"
        action={
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => onNavigate('invoices')}>
            رجوع للفواتير
          </Button>
        }
      />

      {/* Header controls */}
      <div className="mb-5 rounded-xl2 border border-line bg-white p-4 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="نوع الفاتورة">
            <div className="inline-flex w-full rounded-lg border border-line2 bg-canvas p-1">
              <button
                onClick={() => switchType('sale')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-kufi font-semibold transition ${
                  type === 'sale' ? 'bg-navy-600 text-white shadow-sm' : 'text-gray-500 hover:text-ink'
                }`}
              >
                <ShoppingCart size={15} /> بيع
              </button>
              <button
                onClick={() => switchType('purchase')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-kufi font-semibold transition ${
                  type === 'purchase' ? 'bg-navy-600 text-white shadow-sm' : 'text-gray-500 hover:text-ink'
                }`}
              >
                <ShoppingCart size={15} className="rotate-180" /> شراء
              </button>
            </div>
          </Field>
          <Field label={partyLabel}>
            <select
              className="input-base"
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
            >
              <option value="">— اختر {partyLabel} —</option>
              {partyList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ">
            <input
              type="date"
              className="input-base"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Line items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl2 border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="font-kufi text-sm font-bold text-ink">أصناف الفاتورة</h3>
              <Button size="sm" variant="subtle" icon={<Plus size={14} />} onClick={addRow}>
                إضافة سطر
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-xs font-semibold text-gray-500">
                    <th className="px-3 py-2.5 font-kufi">الصنف</th>
                    <th className="px-3 py-2.5 font-kufi">السعر</th>
                    <th className="px-3 py-2.5 font-kufi">الكمية</th>
                    <th className="px-3 py-2.5 font-kufi">الإجمالي</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const it = items.find((i) => i.id === line.itemId);
                    const oversold = it && type === 'sale' && line.qty > it.quantity;
                    return (
                      <tr key={line.id} className="border-b border-line/70 last:border-0">
                        <td className="px-3 py-2.5">
                          <div className="relative">
                            <button
                              onClick={() => {
                                setOpenItemFor(openItemFor === line.id ? null : line.id);
                                setItemQuery('');
                              }}
                              className="input-base flex items-center justify-between text-right"
                            >
                              <span className={it ? 'font-kufi text-ink' : 'text-gray-400'}>
                                {it ? `${it.code} — ${it.name}` : 'اختر صنف...'}
                              </span>
                              <Search size={14} className="text-gray-400" />
                            </button>
                            {openItemFor === line.id && (
                              <div className="absolute z-20 mt-1 w-full rounded-lg border border-line bg-white shadow-pop">
                                <div className="border-b border-line p-2">
                                  <input
                                    autoFocus
                                    value={itemQuery}
                                    onChange={(e) => setItemQuery(e.target.value)}
                                    placeholder="بحث بالكود أو الاسم..."
                                    className="input-base"
                                  />
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                  {filteredItems.length === 0 ? (
                                    <p className="p-3 text-center text-xs text-gray-400">لا توجد أصناف</p>
                                  ) : (
                                    filteredItems.map((i) => (
                                      <button
                                        key={i.id}
                                        onClick={() => selectItem(line.id, i.id)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-right hover:bg-navy-50"
                                      >
                                        <span className="font-kufi text-sm text-ink">
                                          <span className="font-mono text-xs text-gray-400">{i.code}</span> {i.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          متوفر {formatNum(i.quantity)}
                                        </span>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {oversold && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-rust-600">
                              <AlertTriangle size={11} /> الكمية أكبر من المخزون ({formatNum(it!.quantity)})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            className="input-base w-24"
                            value={line.price || ''}
                            onChange={(e) => setLine(line.id, { price: Number(e.target.value) })}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            className="input-base w-20"
                            value={line.qty || ''}
                            onChange={(e) => setLine(line.id, { qty: Number(e.target.value) })}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-kufi font-bold text-ink">
                            {formatEGP(line.qty * line.price)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => removeRow(line.id)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl2 border border-line bg-white p-5 shadow-card">
            <h3 className="mb-4 font-kufi text-sm font-bold text-ink">ملخص الفاتورة</h3>

            <div className="space-y-3 text-sm">
              <Row label="عدد الأصناف" value={`${itemCount} صنف`} />
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="font-kufi font-semibold text-gray-500">الإجمالي الكلي</span>
                <span className="font-kufi text-xl font-bold text-navy-600">{formatEGP(grandTotal)}</span>
              </div>
              <Field label="المبلغ المدفوع مقدمًا" className="pt-1">
                <input
                  type="number"
                  className="input-base"
                  value={initialPaid || ''}
                  onChange={(e) => setInitialPaid(Number(e.target.value))}
                  placeholder="0"
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg bg-rust-50 px-3 py-2.5">
                <span className="font-kufi font-semibold text-rust-700">المتبقي</span>
                <span className="font-kufi text-lg font-bold text-rust-700">{formatEGP(remaining)}</span>
              </div>
              <Field label="ملاحظات">
                <textarea
                  className="input-base min-h-[70px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات الفاتورة..."
                />
              </Field>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button size="lg" icon={<Save size={16} />} onClick={() => save(false)}>
                حفظ الفاتورة
              </Button>
              <Button size="lg" variant="outline" icon={<Printer size={16} />} onClick={() => save(true)}>
                حفظ وطباعة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-kufi text-gray-500">{label}</span>
      <span className="font-kufi font-semibold text-ink">{value}</span>
    </div>
  );
}