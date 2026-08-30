import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Expense,
  Invoice,
  InvoiceLine,
  Item,
  Party,
  Payment,
  ReturnRecord,
  StockMovement,
} from "@/types";
import {
  seedExpenses,
  seedMovements,
  seedPayments,
  seedReturns,
} from "@/data/seed";
import { api } from "./api";

// Converts a backend Item into the shape the frontend expects
function mapItemFromApi(apiItem: any): Item {
  return {
    id: String(apiItem.itemId),
    code: apiItem.code,
    name: apiItem.name,
    purchasePrice: Number(apiItem.purchasePrice),
    sellingPrice: Number(apiItem.salePrice),
    quantity: apiItem.currentQuantity,
    minQuantity: 5, // backend uses a fixed threshold, not stored per item
  };
}

// Converts the frontend's Item form data into what the backend expects
function mapItemToApi(item: Omit<Item, "id">) {
  return {
    code: item.code,
    name: item.name,
    purchasePrice: item.purchasePrice,
    salePrice: item.sellingPrice,
    currentQuantity: item.quantity,
  };
}

// Converts a backend Customer/Supplier into the frontend Party shape
function mapPartyFromApi(apiParty: any, kind: "customer" | "supplier"): Party {
  return {
    id: String(kind === "customer" ? apiParty.customerId : apiParty.supplierId),
    name: apiParty.name,
    phone: apiParty.phoneNum ?? "",
    balance: apiParty.balance ?? 0,
    type: apiParty.type ?? undefined,
  };
}

// Converts the frontend's Party form data into what the backend expects
function mapPartyToApi(party: Omit<Party, "id" | "balance">) {
  return {
    name: party.name,
    phoneNum: party.phone,
    ...(party.type ? { type: party.type } : {}),
  };
}

// Converts a backend Invoice (list or detail) into the frontend Invoice shape
function mapInvoiceFromApi(apiInvoice: any): Invoice {
  return {
    id: String(apiInvoice.invoiceId),
    number: apiInvoice.invoiceNum,
    type: apiInvoice.invoiceType,
    partyId: String(apiInvoice.customerId ?? apiInvoice.supplierId ?? ""),
    date: apiInvoice.invoiceDate,
    lines: [],
    initialPaid: 0,
    partyName: apiInvoice.partyName,
    total: apiInvoice.total,
    paid: apiInvoice.paid,
    remaining: apiInvoice.remaining,
    status: apiInvoice.status,
  };
}

interface Store {
  items: Item[];
  customers: Party[];
  suppliers: Party[];
  invoices: Invoice[];
  payments: Payment[];
  returns: ReturnRecord[];
  expenses: Expense[];
  movements: StockMovement[];

  addItem: (i: Omit<Item, "id">) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addCustomer: (p: Omit<Party, "id">) => void;
  updateCustomer: (id: string, patch: Partial<Party>) => void;
  deleteCustomer: (id: string) => void;

  addSupplier: (p: Omit<Party, "id">) => void;
  updateSupplier: (id: string, patch: Partial<Party>) => void;
  deleteSupplier: (id: string) => void;

  addInvoice: (inv: Omit<Invoice, "id" | "number">) => Promise<Invoice>;
  addPayment: (p: Omit<Payment, "id">) => void;
  addReturn: (r: Omit<ReturnRecord, "id" | "number">) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

let counter = 1000;
const nextId = (prefix: string) => `${prefix}${++counter}`;
const nextNumber = (prefix: string, len: number) => {
  counter += 1;
  return `${prefix}${String(counter).padStart(len, "0")}`;
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Party[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [returns, setReturns] = useState<ReturnRecord[]>(seedReturns);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [movements, setMovements] = useState<StockMovement[]>(seedMovements);

  useEffect(() => {
    api.get("/items").then((data) => setItems(data.map(mapItemFromApi)));
    api
      .get("/customers")
      .then((data) =>
        setCustomers(data.map((c: any) => mapPartyFromApi(c, "customer"))),
      );
    api
      .get("/suppliers")
      .then((data) =>
        setSuppliers(data.map((s: any) => mapPartyFromApi(s, "supplier"))),
      );
    api
      .get("/invoices")
      .then((data) => setInvoices(data.map(mapInvoiceFromApi)));
  }, []);

  const pushMovement = (m: Omit<StockMovement, "id">) =>
    setMovements((prev) => [...prev, { ...m, id: nextId("m") }]);

  const value = useMemo<Store>(
    () => ({
      items,
      customers,
      suppliers,
      invoices,
      payments,
      returns,
      expenses,
      movements,

      addItem: (i) => {
        api.post("/items", mapItemToApi(i)).then((created) => {
          setItems((prev) => [...prev, mapItemFromApi(created)]);
        });
      },
      updateItem: (id, patch) => {
        api
          .put(
            `/items/${id}`,
            mapItemToApi({ ...items.find((it) => it.id === id)!, ...patch }),
          )
          .then((updated) => {
            setItems((prev) =>
              prev.map((it) => (it.id === id ? mapItemFromApi(updated) : it)),
            );
          });
      },
      deleteItem: (id) => {
        api
          .delete(`/items/${id}`)
          .then(() => {
            setItems((prev) => prev.filter((it) => it.id !== id));
          })
          .catch((err) => {
            alert(err.message || "Failed to delete item");
          });
      },

      addCustomer: (p) => {
        api
          .post("/customers", mapPartyToApi(p))
          .then((created) => {
            setCustomers((prev) => [...prev, mapPartyFromApi(created, "customer")]);
          })
          .catch((err) => alert(err.message));
      },
      updateCustomer: (id, patch) => {
        const current = customers.find((c) => c.id === id)!;
        api
          .put(`/customers/${id}`, mapPartyToApi({ ...current, ...patch }))
          .then((updated) => {
            setCustomers((prev) =>
              prev.map((c) => (c.id === id ? mapPartyFromApi(updated, "customer") : c)),
            );
          })
          .catch((err) => alert(err.message));
      },
      deleteCustomer: (id) => {
        api
          .delete(`/customers/${id}`)
          .then(() => {
            setCustomers((prev) => prev.filter((c) => c.id !== id));
          })
          .catch((err) => alert(err.message));
      },

      addSupplier: (p) => {
        api
          .post("/suppliers", mapPartyToApi(p))
          .then((created) => {
            setSuppliers((prev) => [...prev, mapPartyFromApi(created, "supplier")]);
          })
          .catch((err) => alert(err.message));
      },
      updateSupplier: (id, patch) => {
        const current = suppliers.find((s) => s.id === id)!;
        api
          .put(`/suppliers/${id}`, mapPartyToApi({ ...current, ...patch }))
          .then((updated) => {
            setSuppliers((prev) =>
              prev.map((s) => (s.id === id ? mapPartyFromApi(updated, "supplier") : s)),
            );
          })
          .catch((err) => alert(err.message));
      },
      deleteSupplier: (id) => {
        api
          .delete(`/suppliers/${id}`)
          .then(() => {
            setSuppliers((prev) => prev.filter((s) => s.id !== id));
          })
          .catch((err) => alert(err.message));
      },

      addInvoice: async (inv) => {
        const payload = {
          invoiceNum: `INV-${Date.now()}`,
          invoiceType: inv.type,
          ...(inv.type === "sale"
            ? { customerId: Number(inv.partyId) }
            : { supplierId: Number(inv.partyId) }),
          invoiceDate: new Date(inv.date).toISOString(),
          terms: inv.lines.map((l) => ({
            itemId: Number(l.itemId),
            quantity: l.qty,
            price: l.price,
          })),
        };

        const created = await api.post("/invoices", payload);

        if (inv.initialPaid > 0) {
          await api.post("/payments", {
            invoiceId: created.invoiceId,
            amount: inv.initialPaid,
            paymentDate: new Date().toISOString(),
            paymentMethod: "cash",
          });
        }

        // Refresh everything the invoice could have affected
        const [freshInvoices, freshItems] = await Promise.all([
          api.get("/invoices"),
          api.get("/items"),
        ]);
        setInvoices(freshInvoices.map(mapInvoiceFromApi));
        setItems(freshItems.map(mapItemFromApi));

        if (inv.type === "sale") {
          const freshCustomers = await api.get("/customers");
          setCustomers(
            freshCustomers.map((c: any) => mapPartyFromApi(c, "customer")),
          );
        } else {
          const freshSuppliers = await api.get("/suppliers");
          setSuppliers(
            freshSuppliers.map((s: any) => mapPartyFromApi(s, "supplier")),
          );
        }

        const match = freshInvoices.find(
          (i: any) => i.invoiceId === created.invoiceId,
        );
        return mapInvoiceFromApi(match ?? created);
      },

      addPayment: (p) => {
        setPayments((prev) => [...prev, { ...p, id: nextId("p") }]);
        // reduce invoice's party balance
        const inv = invoices.find((i) => i.id === p.invoiceId);
        if (inv) {
          const setParty = inv.type === "sale" ? setCustomers : setSuppliers;
          const delta = inv.type === "sale" ? -p.amount : p.amount;
          setParty((prev) =>
            prev.map((pt) =>
              pt.id === inv.partyId
                ? { ...pt, balance: pt.balance + delta }
                : pt,
            ),
          );
        }
      },

      addReturn: (r) => {
        const id = nextId("r");
        const number = nextNumber("R-", 3);
        setReturns((prev) => [{ ...r, id, number }, ...prev]);
        r.lines.forEach((ln) => {
          setItems((prev) =>
            prev.map((it) =>
              it.id === ln.itemId
                ? { ...it, quantity: it.quantity + ln.qty }
                : it,
            ),
          );
          pushMovement({
            itemId: ln.itemId,
            direction: "in",
            refType: "return",
            refId: id,
            qty: ln.qty,
            date: r.date,
          });
        });
      },

      addExpense: (e) =>
        setExpenses((prev) => [{ ...e, id: nextId("e") }, ...prev]),
      deleteExpense: (id) =>
        setExpenses((prev) => prev.filter((e) => e.id !== id)),
    }),
    [
      items,
      customers,
      suppliers,
      invoices,
      payments,
      returns,
      expenses,
      movements,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/* ---- derived helpers ---- */
export const lineTotal = (l: InvoiceLine) => l.qty * l.price;

export const invoiceTotal = (inv: Invoice) =>
  inv.lines.reduce((s, l) => s + lineTotal(l), 0);

export const invoicePaid = (inv: Invoice, allPayments: Payment[]) =>
  inv.initialPaid +
  allPayments
    .filter((p) => p.invoiceId === inv.id)
    .reduce((s, p) => s + p.amount, 0);

export const invoiceRemaining = (inv: Invoice, allPayments: Payment[]) =>
  invoiceTotal(inv) - invoicePaid(inv, allPayments);

export const invoiceStatus = (inv: Invoice, allPayments: Payment[]) => {
  const r = invoiceRemaining(inv, allPayments);
  if (r <= 0) return "paid" as const;
  const paid = invoicePaid(inv, allPayments);
  return paid > 0 ? ("partial" as const) : ("unpaid" as const);
};