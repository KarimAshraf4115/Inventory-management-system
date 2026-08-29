# Inventory Management System — API Endpoints Reference

Base path: `/api`

---

## Customers — `/api/customers`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers?search=` | List all customers, optional search by name/phone |
| GET | `/api/customers/:id` | Get one customer |
| GET | `/api/customers/:id/balance` | Get customer's derived balance (sales - returns - payments) |
| POST | `/api/customers` | Create a customer |
| PUT | `/api/customers/:id` | Update a customer |
| DELETE | `/api/customers/:id` | Delete a customer (blocked if invoices/returns exist) |

## Suppliers — `/api/suppliers`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/suppliers?search=` | List all suppliers, optional search by name/phone |
| GET | `/api/suppliers/:id` | Get one supplier |
| GET | `/api/suppliers/:id/balance` | Get supplier's derived balance (purchases - returns - payments) |
| POST | `/api/suppliers` | Create a supplier (includes `type`: factory/office) |
| PUT | `/api/suppliers/:id` | Update a supplier |
| DELETE | `/api/suppliers/:id` | Delete a supplier (blocked if invoices/returns exist) |

## Items — `/api/items`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items?search=` | List all items, optional search by code/name |
| GET | `/api/items/low-stock?threshold=` | List items below stock threshold (default 10) |
| GET | `/api/items/:id` | Get one item |
| GET | `/api/items/:id/movements` | Get stock movement history for this item |
| POST | `/api/items` | Create an item (rejects duplicate code) |
| PUT | `/api/items/:id` | Update an item (rejects duplicate code) |
| DELETE | `/api/items/:id` | Delete an item (blocked if invoice/return/movement records exist) |

## Invoices — `/api/invoices`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/invoices?invoiceNum=&invoiceType=&from=&to=` | List invoices with filters |
| GET | `/api/invoices/:id` | Get one invoice with derived totals (total, paid, returned, outstanding) |
| POST | `/api/invoices` | Create a sale or purchase invoice (transactional: updates stock + logs movement) |

## Returns — `/api/returns`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/returns?invoiceId=&returnType=&from=&to=` | List returns with filters |
| GET | `/api/returns/:id` | Get one return with derived total |
| POST | `/api/returns` | Create a return against an original invoice (transactional: reverses stock + logs movement) |

## Payments — `/api/payments`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/:id` | Get one payment |
| POST | `/api/payments` | Register a payment against an invoice (rejects overpayment) |
| PUT | `/api/payments/:id` | Update a payment (currently unrestricted — see note) |
| DELETE | `/api/payments/:id` | Delete a payment |

## Expenses — `/api/expenses`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses?search=` | List all expenses, optional search by type/description |
| GET | `/api/expenses/:id` | Get one expense |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

## Stock Movements — `/api/stock-movements`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stock-movements?search=&from=&to=` | List all stock movements, filterable by item code/name and date range |

## Dashboard — `/api/dashboard`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Aggregate stats: today's sales, current stock value, low-stock count, total receivable |

---

## Notes / Known Decisions

- **Compute-on-read:** All balances, totals, and remaining amounts (customer balance, supplier balance, invoice outstanding, return total) are calculated live from raw rows (`Invoice_Terms`, `Payments`, `Return_Items`) — never stored as cached fields. This guarantees consistency across every screen.
- **Payment `update()`** is currently unrestricted (can edit `amount`/`invoiceId` after creation). Deliberately left as-is for now; flagged as a potential audit-trail gap if stricter financial controls are needed later.
- **Auth module** is out of scope for now — not implemented.
- Every module enforces its business rules at three layers where relevant: DB CHECK constraint → service-layer validation → DTO validation (e.g. invoice/return "exactly one of customer/supplier" rule, valid type enums).
