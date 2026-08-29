ALTER TABLE [Invoices] ADD CONSTRAINT CHK_Invoice_Type CHECK (Invoice_Type IN ('sale', 'purchase'));

ALTER TABLE [Returns] ADD CONSTRAINT CHK_Return_Type CHECK (Return_Type IN ('from_customer', 'to_supplier'));

ALTER TABLE [Stock_Movement] ADD CONSTRAINT CHK_Movement_Type CHECK (Movement_Type IN ('sale_out', 'purchase_in', 'sale_return_in', 'purchase_return_out'));

ALTER TABLE [Invoices] ADD CONSTRAINT CHK_Invoice_Party CHECK (
  (Customer_Id IS NOT NULL AND Supplier_Id IS NULL) OR
  (Customer_Id IS NULL AND Supplier_Id IS NOT NULL)
);

ALTER TABLE [Returns] ADD CONSTRAINT CHK_Return_Party CHECK (
  (Customer_Id IS NOT NULL AND Supplier_Id IS NULL) OR
  (Customer_Id IS NULL AND Supplier_Id IS NOT NULL)
);