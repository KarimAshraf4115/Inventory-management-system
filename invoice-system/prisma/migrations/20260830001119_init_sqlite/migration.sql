-- CreateTable
CREATE TABLE "Suppliers" (
    "supplier_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "Phone-Num" TEXT,
    "Type" TEXT
);

-- CreateTable
CREATE TABLE "Customers" (
    "Customer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Phone_Num" TEXT
);

-- CreateTable
CREATE TABLE "Items" (
    "Item_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Purchas_Price" DECIMAL NOT NULL,
    "Sale-Price" DECIMAL NOT NULL,
    "Current_Quantity" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Invoices" (
    "Invoice_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Invoice_Num" TEXT NOT NULL,
    "Invoice_Type" TEXT NOT NULL,
    "Customer_Id" INTEGER,
    "Supplier_Id" INTEGER,
    "Invoice_Date" DATETIME NOT NULL,
    CONSTRAINT "Invoices_Customer_Id_fkey" FOREIGN KEY ("Customer_Id") REFERENCES "Customers" ("Customer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoices_Supplier_Id_fkey" FOREIGN KEY ("Supplier_Id") REFERENCES "Suppliers" ("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice_Terms" (
    "Invoice_Id" INTEGER NOT NULL,
    "Item_Id" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Price" DECIMAL NOT NULL,

    PRIMARY KEY ("Invoice_Id", "Item_Id"),
    CONSTRAINT "Invoice_Terms_Invoice_Id_fkey" FOREIGN KEY ("Invoice_Id") REFERENCES "Invoices" ("Invoice_Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_Terms_Item_Id_fkey" FOREIGN KEY ("Item_Id") REFERENCES "Items" ("Item_Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Returns" (
    "Return_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Invoice_Id" INTEGER NOT NULL,
    "Return_Date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Return_Type" TEXT NOT NULL,
    "Reason" TEXT,
    "Customer_Id" INTEGER,
    "Supplier_Id" INTEGER,
    CONSTRAINT "Returns_Invoice_Id_fkey" FOREIGN KEY ("Invoice_Id") REFERENCES "Invoices" ("Invoice_Id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Returns_Customer_Id_fkey" FOREIGN KEY ("Customer_Id") REFERENCES "Customers" ("Customer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Returns_Supplier_Id_fkey" FOREIGN KEY ("Supplier_Id") REFERENCES "Suppliers" ("supplier_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Return_Items" (
    "Return_Id" INTEGER NOT NULL,
    "Item_Id" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Price" DECIMAL NOT NULL,

    PRIMARY KEY ("Return_Id", "Item_Id"),
    CONSTRAINT "Return_Items_Return_Id_fkey" FOREIGN KEY ("Return_Id") REFERENCES "Returns" ("Return_Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Return_Items_Item_Id_fkey" FOREIGN KEY ("Item_Id") REFERENCES "Items" ("Item_Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stock_Movement" (
    "Movement_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Item_Id" INTEGER NOT NULL,
    "Movement_Type" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Movement_Date" DATETIME NOT NULL,
    "Invoice_Id" INTEGER,
    "Return_Id" INTEGER,
    CONSTRAINT "Stock_Movement_Item_Id_fkey" FOREIGN KEY ("Item_Id") REFERENCES "Items" ("Item_Id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Stock_Movement_Invoice_Id_fkey" FOREIGN KEY ("Invoice_Id") REFERENCES "Invoices" ("Invoice_Id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "Stock_Movement_Return_Id_fkey" FOREIGN KEY ("Return_Id") REFERENCES "Returns" ("Return_Id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Payments" (
    "Payment_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Invoice_Id" INTEGER NOT NULL,
    "Amount" DECIMAL NOT NULL,
    "Payment_Date" DATETIME NOT NULL,
    "Payment_Method" TEXT NOT NULL,
    "Notes" TEXT,
    CONSTRAINT "Payments_Invoice_Id_fkey" FOREIGN KEY ("Invoice_Id") REFERENCES "Invoices" ("Invoice_Id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expenses" (
    "Expense_Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Type" TEXT NOT NULL,
    "Amount" DECIMAL NOT NULL,
    "Expense_Date" DATETIME NOT NULL,
    "Description" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_Phone-Num_key" ON "Suppliers"("Phone-Num");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_Phone_Num_key" ON "Customers"("Phone_Num");

-- CreateIndex
CREATE UNIQUE INDEX "Items_Code_key" ON "Items"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_Invoice_Num_key" ON "Invoices"("Invoice_Num");

-- CreateIndex
CREATE INDEX "Invoices_Customer_Id_idx" ON "Invoices"("Customer_Id");

-- CreateIndex
CREATE INDEX "Invoices_Supplier_Id_idx" ON "Invoices"("Supplier_Id");

-- CreateIndex
CREATE INDEX "Invoices_Invoice_Date_idx" ON "Invoices"("Invoice_Date");

-- CreateIndex
CREATE INDEX "Invoice_Terms_Item_Id_idx" ON "Invoice_Terms"("Item_Id");

-- CreateIndex
CREATE INDEX "Returns_Invoice_Id_idx" ON "Returns"("Invoice_Id");

-- CreateIndex
CREATE INDEX "Returns_Customer_Id_idx" ON "Returns"("Customer_Id");

-- CreateIndex
CREATE INDEX "Returns_Supplier_Id_idx" ON "Returns"("Supplier_Id");

-- CreateIndex
CREATE INDEX "Return_Items_Item_Id_idx" ON "Return_Items"("Item_Id");

-- CreateIndex
CREATE INDEX "Stock_Movement_Item_Id_idx" ON "Stock_Movement"("Item_Id");

-- CreateIndex
CREATE INDEX "Stock_Movement_Invoice_Id_idx" ON "Stock_Movement"("Invoice_Id");

-- CreateIndex
CREATE INDEX "Stock_Movement_Return_Id_idx" ON "Stock_Movement"("Return_Id");

-- CreateIndex
CREATE INDEX "Stock_Movement_Movement_Date_idx" ON "Stock_Movement"("Movement_Date");

-- CreateIndex
CREATE INDEX "Payments_Invoice_Id_idx" ON "Payments"("Invoice_Id");

-- CreateIndex
CREATE INDEX "Expenses_Expense_Date_idx" ON "Expenses"("Expense_Date");
