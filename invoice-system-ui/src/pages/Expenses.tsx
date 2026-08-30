import { useState } from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useStore } from "@/store";
import { Button, Field, PageHeader } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { DataTable } from "@/components/DataTable";
import { formatEGP, formatDate, todayISO } from "@/utils";

const types = ["إيجار", "كهرباء", "مياه", "رواتب", "صيانة", "نقل", "أخرى"];

export function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useStore();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState(types[0]);
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState("");

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const submit = async () => {
    if (!amount || !desc.trim()) return;
    try {
      await addExpense({ date, type, amount, description: desc });
      setOpen(false);
      setAmount(0);
      setDesc("");
    } catch (err: any) {
      alert(err.message || "فشل إضافة المصروف");
    }
  };

  return (
    <div>
      <PageHeader
        title="المصروفات"
        subtitle={`${expenses.length} مصروف • الإجمالي ${formatEGP(total)}`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            إضافة مصروف
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "date",
            header: "التاريخ",
            render: (e) => (
              <span className="text-gray-500">{formatDate(e.date)}</span>
            ),
          },
          {
            key: "type",
            header: "النوع",
            render: (e) => (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700 ring-1 ring-inset ring-navy-200">
                <Receipt size={11} /> {e.type}
              </span>
            ),
          },
          {
            key: "desc",
            header: "الوصف",
            render: (e) => (
              <span className="font-kufi text-ink">{e.description}</span>
            ),
          },
          {
            key: "amount",
            header: "المبلغ",
            render: (e) => (
              <span className="font-kufi font-bold text-rust-600">
                {formatEGP(e.amount)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "إجراءات",
            render: (e) => (
              <button
                onClick={() => deleteExpense(e.id).catch((err: any) => alert(err.message || 'فشل الحذف'))}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            ),
          },
        ]}
        rows={expenses}
        empty="لا توجد مصروفات"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="إضافة مصروف جديد"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={submit}>حفظ</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="التاريخ">
              <input
                type="date"
                className="input-base"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="النوع">
              <select
                className="input-base"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="المبلغ (ج.م)">
            <input
              type="number"
              className="input-base"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </Field>
          <Field label="الوصف">
            <input
              className="input-base font-kufi"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="تفاصيل المصروف"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
