import { useMemo, useState } from "react";
import { Plus, Pencil, FileText, Trash2 } from "lucide-react";
import { useStore } from "@/store";
import { Button, Field, PageHeader, Badge } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { DataTable, SearchToolbar } from "@/components/DataTable";
import { formatEGP } from "@/utils";
import type { Party, PageKey } from "@/types";

interface Props {
  kind: "customers" | "suppliers";
  onNavigate: (p: PageKey) => void;
}

export function PartiesPage({ kind, onNavigate }: Props) {
  const store = useStore();
  const isCustomers = kind === "customers";
  const list = isCustomers ? store.customers : store.suppliers;
  const add = isCustomers ? store.addCustomer : store.addSupplier;
  const update = isCustomers ? store.updateCustomer : store.updateSupplier;
  const remove = isCustomers ? store.deleteCustomer : store.deleteSupplier;

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [form, setForm] = useState<Omit<Party, "id">>({
    name: "",
    phone: "",
    balance: 0,
    type: isCustomers ? undefined : "مصنع",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q),
    );
  }, [list, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      phone: "",
      balance: 0,
      type: isCustomers ? undefined : "مصنع",
    });
    setOpen(true);
  };

  const openEdit = (p: Party) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) update(editing.id, form);
    else add(form);
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={isCustomers ? "العملاء" : "الموردين"}
        subtitle={`${list.length} ${isCustomers ? "عميل" : "مورد"}`}
        action={
          <Button icon={<Plus size={16} />} onClick={openAdd}>
            {isCustomers ? "إضافة عميل" : "إضافة مورد"}
          </Button>
        }
      />

      <SearchToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="بحث بالاسم أو الهاتف..."
      />

      <DataTable<Party>
        columns={[
          {
            key: "name",
            header: "الاسم",
            render: (p) => (
              <span className="font-kufi font-semibold text-ink">{p.name}</span>
            ),
          },
          {
            key: "phone",
            header: "الهاتف",
            render: (p) => (
              <span className="font-mono text-gray-600" dir="ltr">
                {p.phone}
              </span>
            ),
          },
          ...(isCustomers
            ? []
            : [
                {
                  key: "type",
                  header: "النوع",
                  render: (p: Party) => (
                    <Badge className="bg-navy-50 text-navy-700 ring-navy-200">
                      {p.type ?? "—"}
                    </Badge>
                  ),
                },
              ]),
          {
            key: "balance",
            header: "الرصيد",
            render: (p) => {
              const label = isCustomers
                ? p.balance > 0
                  ? "عليه"
                  : p.balance < 0
                    ? "له"
                    : "—"
                : p.balance > 0
                  ? "له"
                  : p.balance < 0
                    ? "عليه"
                    : "—";
              const colorClass =
                p.balance === 0
                  ? "text-gray-500"
                  : label === "عليه"
                    ? "text-red-600"
                    : "text-emerald-600";
              return (
                <span className={`font-kufi font-bold ${colorClass}`}>
                  {label}{" "}
                  {p.balance !== 0 ? formatEGP(Math.abs(p.balance)) : ""}
                </span>
              );
            },
          },
          {
            key: "actions",
            header: "إجراءات",
            render: (p) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-navy-50 hover:text-navy-600"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onNavigate("payments")}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-navy-50 hover:text-navy-600"
                  title="كشف حساب"
                >
                  <FileText size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`حذف "${p.name}"؟`)) remove(p.id);
                  }}
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
        empty={isCustomers ? "لا يوجد عملاء" : "لا يوجد موردين"}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          editing
            ? isCustomers
              ? "تعديل عميل"
              : "تعديل مورد"
            : isCustomers
              ? "إضافة عميل"
              : "إضافة مورد"
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={save}>حفظ</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="الاسم">
            <input
              className="input-base font-kufi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={
                isCustomers ? "اسم العميل / المحل" : "اسم المورد / المصنع"
              }
            />
          </Field>
          <Field label="رقم الهاتف">
            <input
              className="input-base font-mono"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
            />
          </Field>
          {!isCustomers && (
            <Field label="النوع">
              <select
                className="input-base"
                value={form.type ?? "مصنع"}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="مصنع">مصنع</option>
                <option value="مكتب">مكتب</option>
                <option value="تاجر">تاجر</option>
              </select>
            </Field>
          )}
          <Field label="الرصيد الافتتاحي (ج.م)">
            <input
              type="number"
              className="input-base"
              value={form.balance || ""}
              onChange={(e) =>
                setForm({ ...form, balance: Number(e.target.value) })
              }
              placeholder="موجب = مدين، سالب = دائن"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
