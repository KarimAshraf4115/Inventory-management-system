import type {
  Expense,
  Invoice,
  Item,
  Party,
  Payment,
  ReturnRecord,
  StockMovement,
} from '@/types';

export const seedItems: Item[] = [
  { id: 'i1', code: '1259', name: 'ديور نيوسكاي سادة BS', purchasePrice: 410, sellingPrice: 460, quantity: 24, minQuantity: 5 },
  { id: 'i2', code: '4111', name: 'وايدليج جينز سلوثي', purchasePrice: 420, sellingPrice: 470, quantity: 31, minQuantity: 8 },
  { id: 'i3', code: '1255', name: 'بيكا Rich لون 1', purchasePrice: 420, sellingPrice: 450, quantity: 3, minQuantity: 6 },
  { id: 'i4', code: '3320', name: 'تيشيرت قطن ملوّن', purchasePrice: 120, sellingPrice: 165, quantity: 80, minQuantity: 15 },
  { id: 'i5', code: '3321', name: 'جاكيت جلد بني', purchasePrice: 680, sellingPrice: 820, quantity: 7, minQuantity: 4 },
  { id: 'i6', code: '7781', name: 'بنطلون كارغو رمادي', purchasePrice: 310, sellingPrice: 360, quantity: 2, minQuantity: 10 },
  { id: 'i7', code: '7782', name: 'كاب قطن أسود', purchasePrice: 95, sellingPrice: 140, quantity: 54, minQuantity: 12 },
];

export const seedCustomers: Party[] = [
  { id: 'c1', name: 'محمد رجيب البدري', phone: '01012345678', balance: 82385 },
  { id: 'c2', name: 'أحمد سعيد للملابس', phone: '01098765432', balance: 7600 },
  { id: 'c3', name: 'شركة النخبة للتجارة', phone: '01155667788', balance: 0 },
  { id: 'c4', name: 'كايرو ماركت', phone: '01233445566', balance: -1500 },
];

export const seedSuppliers: Party[] = [
  { id: 's1', name: 'مصنع بلاك هورس', phone: '0223456789', balance: 0, type: 'مصنع' },
  { id: 's2', name: 'مكتب النيل للأقمشة', phone: '0229988776', balance: 18000, type: 'مكتب' },
  { id: 's3', name: 'مصنع الدلتا للملابس', phone: '0227766554', balance: 5000, type: 'مصنع' },
];

export const seedInvoices: Invoice[] = [
  {
    id: 'inv1',
    number: '1211',
    type: 'sale',
    partyId: 'c1',
    date: '2026-08-13',
    lines: [
      { id: 'l1', itemId: 'i1', qty: 15, price: 460 },
      { id: 'l2', itemId: 'i2', qty: 35, price: 470 },
    ],
    notes: 'توريد دفعة أولى',
    initialPaid: 0,
  },
  {
    id: 'inv2',
    number: '1210',
    type: 'purchase',
    partyId: 's1',
    date: '2026-08-10',
    lines: [
      { id: 'l3', itemId: 'i4', qty: 200, price: 120 },
      { id: 'l4', itemId: 'i7', qty: 100, price: 95 },
    ],
    initialPaid: 45000,
  },
  {
    id: 'inv3',
    number: '1209',
    type: 'sale',
    partyId: 'c2',
    date: '2026-08-09',
    lines: [
      { id: 'l5', itemId: 'i1', qty: 10, price: 460 },
      { id: 'l6', itemId: 'i3', qty: 15, price: 450 },
    ],
    initialPaid: 7600,
  },
];

export const seedPayments: Payment[] = [
  { id: 'p1', invoiceId: 'inv1', amount: 30000, date: '2026-08-15', method: 'cash', notes: 'دفعة أولى' },
];

export const seedReturns: ReturnRecord[] = [
  {
    id: 'r1',
    number: 'R-001',
    originalInvoiceId: 'inv3',
    date: '2026-08-12',
    reason: 'عيب في القماش',
    lines: [{ itemId: 'i3', qty: 2, price: 450 }],
  },
];

export const seedExpenses: Expense[] = [
  { id: 'e1', date: '2026-08-20', type: 'إيجار', amount: 8000, description: 'إيجار المحل - أغسطس' },
  { id: 'e2', date: '2026-08-22', type: 'كهرباء', amount: 1250, description: 'فاتورة الكهرباء' },
  { id: 'e3', date: '2026-08-25', type: 'رواتب', amount: 15000, description: 'رواتب العمال' },
];

export const seedMovements: StockMovement[] = [
  { id: 'm1', itemId: 'i1', direction: 'out', refType: 'invoice', refId: 'inv1', qty: 15, date: '2026-08-13' },
  { id: 'm2', itemId: 'i2', direction: 'out', refType: 'invoice', refId: 'inv1', qty: 35, date: '2026-08-13' },
  { id: 'm3', itemId: 'i4', direction: 'in', refType: 'invoice', refId: 'inv2', qty: 200, date: '2026-08-10' },
  { id: 'm4', itemId: 'i7', direction: 'in', refType: 'invoice', refId: 'inv2', qty: 100, date: '2026-08-10' },
  { id: 'm5', itemId: 'i1', direction: 'out', refType: 'invoice', refId: 'inv3', qty: 10, date: '2026-08-09' },
  { id: 'm6', itemId: 'i3', direction: 'in', refType: 'return', refId: 'r1', qty: 2, date: '2026-08-12' },
];
