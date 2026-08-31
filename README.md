╔══════════════════════════════════════════════════════════════════╗
║        INVENTORY & INVOICING MANAGEMENT SYSTEM                     ║
║        A Full-Stack Business Operations Platform                   ║
╚══════════════════════════════════════════════════════════════════╝


TABLE OF CONTENTS
─────────────────
  1. Overview
  2. Key Capabilities
  3. System Architecture
  4. Design Principles
  5. Technology Stack
  6. Data Model Summary
  7. Getting Started
  8. API Reference
  9. Project Structure
  10. Contributors
  11. License


1. OVERVIEW
───────────
The Inventory & Invoicing Management System is a full-stack web
application designed to give small distribution and retail
businesses a single, reliable source of truth for their operations —
replacing manual bookkeeping, disconnected spreadsheets, and paper
invoices with one connected, automated platform.

The system manages the complete operational cycle of a trading
business: purchasing stock from suppliers, selling it to customers,
processing returns, collecting payments, tracking expenses, and
maintaining an accurate, real-time view of inventory and financial
position at all times.

Every transaction in the system is designed to propagate its effects
automatically and consistently across all related records — so a
single sale updates inventory, logs a stock movement, and adjusts a
customer's balance in one atomic operation, with no manual
reconciliation required.


2. KEY CAPABILITIES
────────────────────

  Inventory Management
    - Maintain a full product catalog with cost and sale pricing
    - Real-time stock quantity tracking per item
    - Automatic low-stock alerts based on configurable thresholds
    - Complete, permanent movement history per item

  Customer & Supplier Relationship Management
    - Centralized directory of trading partners
    - Live-calculated account balances (receivable / payable)
    - Full transaction history per party

  Invoicing
    - Dual invoice types: Sales (to customers) and Purchases
      (from suppliers)
    - Multi-line invoices with per-item quantity and pricing
    - Automatic, transactional stock and balance adjustment on save
    - Enforced data integrity (e.g. an invoice must belong to
      exactly one customer or one supplier, never both)

  Payments
    - Record partial or full payments against any invoice
    - Built-in overpayment protection
    - Real-time recalculation of outstanding balances

  Returns
    - Process customer returns and supplier returns independently
    - Automatic reversal of stock movements and balances
    - Full traceability back to the originating invoice
    - Quantity validation against original invoice lines

  Expense Tracking
    - Record and categorize operating expenses independent of
      inventory transactions

  Stock Movement Ledger
    - An immutable, fully auditable log of every inventory
      movement, its cause, and its source document
    - System-generated only — never directly editable by users

  Executive Dashboard
    - Real-time snapshot of business health: daily sales,
      inventory valuation, low-stock warnings, and total
      receivables


3. SYSTEM ARCHITECTURE
────────────────────────

    ┌─────────────────────┐        HTTPS / REST         ┌──────────────────────┐
    │                      │  ─────────────────────────>  │                      │
    │   Frontend (SPA)     │                               │   Backend API         │
    │   React + Vite + TS  │  <─────────────────────────  │   NestJS + Prisma     │
    │                      │        JSON responses        │                      │
    └─────────────────────┘                               └───────────┬──────────┘
                                                                        │
                                                                        │ Prisma ORM
                                                                        ▼
                                                              ┌──────────────────┐
                                                              │   SQLite Database │
                                                              └──────────────────┘

  The backend exposes a versioned REST API consumed by a decoupled
  single-page frontend application. All business logic, validation,
  and data integrity rules are enforced server-side, ensuring the
  system remains consistent regardless of which client accesses it.


4. DESIGN PRINCIPLES
──────────────────────

  Compute-on-Read, Never Cache
    All financial figures — invoice totals, amounts paid, return
    values, and party balances — are calculated live from
    underlying transactional data on every request. Nothing is
    pre-computed or cached, eliminating any possibility of figures
    drifting out of sync with reality.

  Immutable Financial History
    Once an invoice has recorded activity (line items, payments,
    or stock movements), it cannot be deleted. This mirrors
    standard accounting practice, where financial records are
    voided or reversed rather than erased, preserving a complete
    and honest audit trail.

  System-Owned Automation
    Certain records — most notably stock movements — can never be
    created or modified directly by a user. They exist solely as
    the automatic, provable consequence of a legitimate business
    transaction (an invoice or a return), guaranteeing the
    inventory ledger can always be trusted.

  Referential Integrity by Design
    Every relationship in the data model enforces strict rules —
    an invoice belongs to exactly one party, a return must
    reference a valid original invoice, and quantities returned
    can never exceed quantities originally transacted.


5. TECHNOLOGY STACK
─────────────────────

  Layer            Technology
  ────────────────────────────────────────────────
  Frontend          React, TypeScript, Vite
  Backend           NestJS (Node.js, TypeScript)
  ORM               Prisma
  Database          SQLite
  API Style         RESTful JSON API


6. DATA MODEL SUMMARY
───────────────────────

  Item            <──   Invoice_Terms   ──>   Invoice
  Item            <──   Return_Items    ──>   Return
  Invoice         <──   Payments
  Invoice         <──   Returns
  Invoice / Return <──  Stock_Movement  (exactly one source per record)
  Customer        <──   Invoices (sale) / Returns
  Supplier        <──   Invoices (purchase) / Returns

  Balances for Customers and Suppliers, and totals for Invoices and
  Returns, are derived attributes — computed from these
  relationships rather than stored directly.


7. GETTING STARTED
────────────────────

  Prerequisites
    - Node.js 18 or later
    - npm
    - Git

  Backend Setup
    cd invoice-system
    npm install

    Create a .env file:
      DATABASE_URL="file:./dev.db"
      PORT=3000

    npx prisma generate
    npx prisma migrate dev
    npm run start:dev

    The API will be available at:
      http://localhost:3000/api

  Frontend Setup
    cd invoice-system-ui
    npm install

    Create a .env file:
      VITE_API_BASE_URL=http://localhost:3000/api

    npm run dev

    The application will be available at:
      http://localhost:5173

  Note: the backend must be running before starting the frontend.


8. API REFERENCE
──────────────────

  Base URL: /api

  Resource            Endpoints
  ───────────────────────────────────────────────────
  Items               GET, POST, PUT, DELETE /items
  Customers           GET, POST, PUT, DELETE /customers
  Suppliers           GET, POST, PUT, DELETE /suppliers
  Invoices            GET, POST /invoices
  Payments            GET, POST, PUT, DELETE /payments
  Returns             GET, POST /returns
  Expenses            GET, POST, PUT, DELETE /expenses
  Stock Movements     GET /stock-movements (read-only)
  Dashboard           GET /dashboard/summary

  A complete Postman collection documenting every endpoint, request
  shape, and expected response is included for full API exploration
  and testing.


9. PROJECT STRUCTURE
──────────────────────

  Inventory-management-system/
  ├── invoice-system/          Backend application (NestJS + Prisma)
  │   ├── src/                 Feature modules, controllers, services
  │   └── prisma/               Database schema and migrations
  │
  └── invoice-system-ui/       Frontend application (React + Vite)
      └── src/                  Pages, components, and API client


10. CONTRIBUTORS
──────────────────

  Eyad   — Full-stack development
  Karim  — Full-stack development


11. LICENSE
─────────────

  This project was developed for educational purposes as part of an
  academic coursework submission.
