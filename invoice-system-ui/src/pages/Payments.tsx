import { useMemo, useState } from "react";
import { Search, Wallet, PlusCircle } from "lucide-react";
import { useStore, invoiceTotal, invoicePaid, invoiceRemaining } from "@/store";
import { Button, Field, PageHeader, Badge } from "@/components/ui";
import { DataTable } from "@/components/DataTable";
import { formatEGP, formatDate, todayISO, methodLabel } from "@/utils";
import type { PaymentMethod, Payment } from "@/types";

export function PaymentsPage() {
  const { invoices, customers, suppliers, payments, addPayment } = useStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(invoices[0]?.id ?? "");

  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");

  const matchedInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const party =
        (inv.type === "sale" ? customers : suppliers).find(
          (p) => p.id === inv.partyId,
        )?.name ?? "";
      return inv.number.includes(q) || party.toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, invoices, customers, suppliers]);

  const selected = invoices.find((i) => i.id === selectedId) ?? null;
  const invPayments = payments.filter((p) => p.invoiceId === selectedId);
  const selectedParty = selected
    ? (selected.type === "sale" ? customers : suppliers).find(
        (p) => p.id === selected.partyId,
      )
    : null;

  const submit = async () => {
    if (!selected || amount <= 0) return;
    try {
      await addPayment({
        invoiceId: selected.id,
        amount,
        date,
        method,
        notes: note,
      });
      setAmount(0);
      setNote("");
    } catch (err: any) {
      alert(err.message || "فشل تسجيل الدفعة");
    }
  };

  return (
    <div>
      <PageHeader title="المدفوعات" subtitle="تسجيل وعرض دفعات الفواتير" />

      {/* Invoice lookup */}
      <div className="mb-5 rounded-xl2 border border-line bg-white p-4 shadow-card">
        <Field label="بحث عن فاتورة">
          <div className="relative">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب رقم الفاتورة أو اسم الطرف..."
              className="input-base pr-9"
            />
          </div>
        </Field>
        {query && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-line">
            {matchedInvoices.length === 0 ? (
              <p className="p-3 text-center text-xs text-gray-400">
                لا توجد نتائج
              </p>
            ) : (
              matchedInvoices.map((inv) => {
                const party =
                  (inv.type === "sale" ? customers : suppliers).find(
                    (p) => p.id === inv.partyId,
                  )?.name ?? "—";
                return (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setSelectedId(inv.id);
                      setQuery("");
                    }}
                    className="flex w-full items-center justify-between border-b border-line/70 px-3 py-2 text-right text-sm last:border-0 hover:bg-navy-50"
                  >
                    <span>
                      <span className="font-mono text-xs text-gray-400">
                        #{inv.number}
                      </span>{" "}
                      <span className="font-kufi text-ink">{party}</span>
                    </span>
                    <Badge
                      className={
                        inv.type === "sale"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-navy-50 text-navy-700 ring-navy-200"
                      }
                    >
                      {inv.type === "sale" ? "بيع" : "شراء"}
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {!selected ? (
        <div className="rounded-xl2 border border-dashed border-line2 bg-white p-12 text-center text-gray-400">
          <Wallet size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-kufi">اختر فاتورة من البحث لعرض مدفوعاتها</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          {/* Payment history */}
          <div className="lg:col-span-3">
            <div className="rounded-xl2 border border-line bg-white shadow-card">
              <div className="border-b border-line px-4 py-3">
                <h3 className="font-kufi text-sm font-bold text-ink">
                  سجل مدفوعات الفاتورة #{selected.number}
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  {selectedParty?.name} •{" "}
                  {selected.type === "sale" ? "بيع" : "شراء"}
                </p>
              </div>
              {invPayments.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-400">
                  لا توجد دفعات مسجلة بعد
                </p>
              ) : (
                <DataTable<Payment>
                  columns={[
                    {
                      key: "date",
                      header: "التاريخ",
                      render: (p) => (
                        <span className="text-gray-500">
                          {formatDate(p.date)}
                        </span>
                      ),
                    },
                    {
                      key: "amount",
                      header: "المبلغ",
                      render: (p) => (
                        <span className="font-kufi font-bold text-emerald-600">
                          {formatEGP(p.amount)}
                        </span>
                      ),
                    },
                    {
                      key: "method",
                      header: "طريقة الدفع",
                      render: (p) => (
                        <Badge className="bg-navy-50 text-navy-700 ring-navy-200">
                          {methodLabel[p.method]}
                        </Badge>
                      ),
                    },
                    {
                      key: "notes",
                      header: "ملاحظات",
                      render: (p) => (
                        <span className="text-gray-500">{p.notes ?? "—"}</span>
                      ),
                    },
                  ]}
                  rows={invPayments}
                />
              )}
              {/* initial paid row */}
              {selected.initialPaid > 0 && (
                <div className="flex items-center justify-between border-t border-line bg-canvas/50 px-4 py-3 text-sm">
                  <span className="font-kufi text-gray-500">
                    دفعة مقدم (عند إنشاء الفاتورة)
                  </span>
                  <span className="font-kufi font-bold text-emerald-600">
                    {formatEGP(selected.initialPaid)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary + new payment */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
              <h3 className="mb-3 font-kufi text-sm font-bold text-ink">
                ملخص الفاتورة
              </h3>
              <div className="space-y-2.5 text-sm">
                <Row
                  label="الإجمالي"
                  value={formatEGP(invoiceTotal(selected))}
                />
                <Row
                  label="المدفوع"
                  value={formatEGP(invoicePaid(selected, payments))}
                  valueClass="text-emerald-600"
                />
                <div className="flex items-center justify-between border-t border-line pt-2.5">
                  <span className="font-kufi font-semibold text-gray-500">
                    المتبقي
                  </span>
                  <span className="font-kufi text-lg font-bold text-rust-600">
                    {formatEGP(invoiceRemaining(selected, payments))}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
              <h3 className="mb-3 flex items-center gap-2 font-kufi text-sm font-bold text-ink">
                <PlusCircle size={16} className="text-navy-600" /> تسجيل دفعة
                جديدة
              </h3>
              <div className="space-y-3">
                <Field label="المبلغ">
                  <input
                    type="number"
                    className="input-base"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                  />
                </Field>
                <Field label="التاريخ">
                  <input
                    type="date"
                    className="input-base"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Field>
                <Field label="طريقة الدفع">
                  <select
                    className="input-base"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="cash">نقدي</option>
                    <option value="transfer">تحويل بنكي</option>
                    <option value="cheque">شيك</option>
                  </select>
                </Field>
                <Field label="ملاحظات">
                  <input
                    className="input-base"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="اختياري"
                  />
                </Field>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={submit}
                  disabled={amount <= 0}
                >
                  تسجيل الدفعة
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-ink",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-kufi text-gray-500">{label}</span>
      <span className={`font-kufi font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
