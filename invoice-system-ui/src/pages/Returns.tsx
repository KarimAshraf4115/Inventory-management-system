import { useMemo, useState } from "react";
import { Plus, Trash2, Undo2 } from "lucide-react";
import { useStore } from "@/store";
import { Button, Field, PageHeader, Badge } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { formatEGP, formatDate, todayISO, genId } from "@/utils";

export function ReturnsPage() {
  const { invoices, items, customers, suppliers, returns, addReturn } =
    useStore();
  const [open, setOpen] = useState(false);
  const [origId, setOrigId] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState<
    { id: string; itemId: string; qty: number; price: number }[]
  >([]);

  const selectedInv = invoices.find((i) => i.id === origId) ?? null;
  const party = selectedInv
    ? (selectedInv.type === "sale" ? customers : suppliers).find(
        (p) => p.id === selectedInv.partyId,
      )
    : null;

  const { getInvoiceDetail } = useStore();

  const onPickInvoice = async (id: string) => {
    setOrigId(id);
    const inv = await getInvoiceDetail(id);
    setLines(
      inv.lines.map((l) => ({
        id: genId("rl"),
        itemId: l.itemId,
        qty: l.qty,
        price: l.price,
      })),
    );
  };

  const setLine = (
    id: string,
    patch: Partial<{ qty: number; price: number }>,
  ) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);

  const submit = async () => {
    if (!origId || !reason.trim() || !lines.length) return;
    try {
      await addReturn({
        originalInvoiceId: origId,
        date,
        reason,
        lines: lines.map((l) => ({
          itemId: l.itemId,
          qty: l.qty,
          price: l.price,
        })),
      });
      setOpen(false);
      setOrigId("");
      setReason("");
      setLines([]);
    } catch (err: any) {
      alert(err.message || "فشل تسجيل المرتجع");
    }
  };

  const returnsWithParty = useMemo(
    () =>
      returns.map((r) => {
        const inv = invoices.find((i) => i.id === r.originalInvoiceId);
        const p = inv
          ? (inv.type === "sale" ? customers : suppliers).find(
              (x) => x.id === inv.partyId,
            )
          : null;
        return {
          ...r,
          partyName: p?.name ?? "—",
          invNumber: inv?.number ?? "—",
        };
      }),
    [returns, invoices, customers, suppliers],
  );

  return (
    <div>
      <PageHeader
        title="المرتجعات"
        subtitle={`${returns.length} مرتجع`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            مرتجع جديد
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "number",
            header: "رقم المرتجع",
            render: (r) => (
              <span className="font-mono text-xs font-semibold text-navy-600">
                #{r.number}
              </span>
            ),
          },
          {
            key: "inv",
            header: "الفاتورة الأصلية",
            render: (r) => (
              <span className="font-mono text-xs text-gray-500">
                #{r.invNumber}
              </span>
            ),
          },
          {
            key: "party",
            header: "الطرف",
            render: (r) => (
              <span className="font-kufi text-ink">{r.partyName}</span>
            ),
          },
          {
            key: "date",
            header: "التاريخ",
            render: (r) => (
              <span className="text-gray-500">{formatDate(r.date)}</span>
            ),
          },
          {
            key: "reason",
            header: "السبب",
            render: (r) => (
              <span className="font-kufi text-gray-600">{r.reason}</span>
            ),
          },
          {
            key: "qty",
            header: "عدد الأصناف",
            render: (r) => <span className="font-kufi">{r.lines.length}</span>,
          },
          {
            key: "total",
            header: "القيمة",
            render: (r) => (
              <span className="font-kufi font-bold text-rust-600">
                {formatEGP(r.lines.reduce((s, l) => s + l.qty * l.price, 0))}
              </span>
            ),
          },
        ]}
        rows={returnsWithParty}
        empty="لا توجد مرتجعات"
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-900/45"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl2 bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h3 className="font-kufi text-base font-semibold text-ink">
                مرتجع جديد
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="الفاتورة الأصلية" className="sm:col-span-2">
                  <select
                    className="input-base"
                    value={origId}
                    onChange={(e) => onPickInvoice(e.target.value)}
                  >
                    <option value="">— اختر الفاتورة —</option>
                    {invoices.map((inv) => {
                      const p = (
                        inv.type === "sale" ? customers : suppliers
                      ).find((x) => x.id === inv.partyId);
                      return (
                        <option key={inv.id} value={inv.id}>
                          #{inv.number} — {p?.name}
                        </option>
                      );
                    })}
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

              {selectedInv && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Badge
                    className={
                      selectedInv.type === "sale"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-navy-50 text-navy-700 ring-navy-200"
                    }
                  >
                    {selectedInv.type === "sale" ? "فاتورة بيع" : "فاتورة شراء"}
                  </Badge>
                  <span className="text-gray-500">الطرف: {party?.name}</span>
                </div>
              )}

              <Field label="سبب المرتجع" className="mt-4">
                <input
                  className="input-base font-kufi"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: عيب في الصناعة / خطأ في الكمية"
                />
              </Field>

              {lines.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-line">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-canvas/60 text-xs text-gray-500">
                      <tr>
                        <th className="px-3 py-2 font-kufi">الصنف</th>
                        <th className="px-3 py-2 font-kufi">الكمية المرتجعة</th>
                        <th className="px-3 py-2 font-kufi">السعر</th>
                        <th className="px-3 py-2 font-kufi">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => {
                        const it = items.find((i) => i.id === l.itemId);
                        return (
                          <tr key={l.id} className="border-t border-line/70">
                            <td className="px-3 py-2 font-kufi text-ink">
                              {it?.name ?? "—"}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className="input-base w-20"
                                value={l.qty}
                                onChange={(e) =>
                                  setLine(l.id, { qty: Number(e.target.value) })
                                }
                              />
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {formatEGP(l.price)}
                            </td>
                            <td className="px-3 py-2 font-kufi font-bold">
                              {formatEGP(l.qty * l.price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between rounded-lg bg-rust-50 px-4 py-3">
                <span className="font-kufi font-semibold text-rust-700">
                  إجمالي المرتجع
                </span>
                <span className="font-kufi text-lg font-bold text-rust-700">
                  {formatEGP(total)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
              <Button variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button icon={<Undo2 size={16} />} onClick={submit}>
                تأكيد المرتجع
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
