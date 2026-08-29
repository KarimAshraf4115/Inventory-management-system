BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Suppliers] (
    [supplier_id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [Phone-Num] NVARCHAR(1000),
    CONSTRAINT [Suppliers_pkey] PRIMARY KEY CLUSTERED ([supplier_id])
);

-- CreateTable
CREATE TABLE [dbo].[Customers] (
    [Customer_id] INT NOT NULL IDENTITY(1,1),
    [Name] NVARCHAR(1000) NOT NULL,
    [Phone_Num] NVARCHAR(1000),
    CONSTRAINT [Customers_pkey] PRIMARY KEY CLUSTERED ([Customer_id])
);

-- CreateTable
CREATE TABLE [dbo].[Items] (
    [Item_Id] INT NOT NULL IDENTITY(1,1),
    [Code] NVARCHAR(1000) NOT NULL,
    [Name] NVARCHAR(1000) NOT NULL,
    [Purchas_Price] DECIMAL(18,2) NOT NULL,
    [Sale-Price] DECIMAL(18,2) NOT NULL,
    [Current_Quantity] INT NOT NULL CONSTRAINT [Items_Current_Quantity_df] DEFAULT 0,
    CONSTRAINT [Items_pkey] PRIMARY KEY CLUSTERED ([Item_Id]),
    CONSTRAINT [Items_Code_key] UNIQUE NONCLUSTERED ([Code])
);

-- CreateTable
CREATE TABLE [dbo].[Invoices] (
    [Invoice_Id] INT NOT NULL IDENTITY(1,1),
    [Invoice_Num] NVARCHAR(1000) NOT NULL,
    [Invoice_Type] NVARCHAR(1000) NOT NULL,
    [Customer_Id] INT,
    [Supplier_Id] INT,
    [Invoice_Date] DATETIME2 NOT NULL,
    CONSTRAINT [Invoices_pkey] PRIMARY KEY CLUSTERED ([Invoice_Id]),
    CONSTRAINT [Invoices_Invoice_Num_key] UNIQUE NONCLUSTERED ([Invoice_Num])
);

-- CreateTable
CREATE TABLE [dbo].[Invoice_Terms] (
    [Invoice_Id] INT NOT NULL,
    [Item_Id] INT NOT NULL,
    [Quantity] INT NOT NULL,
    [Price] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [Invoice_Terms_pkey] PRIMARY KEY CLUSTERED ([Invoice_Id],[Item_Id])
);

-- CreateTable
CREATE TABLE [dbo].[Returns] (
    [Return_Id] INT NOT NULL IDENTITY(1,1),
    [Invoice_Id] INT NOT NULL,
    [Return_Type] NVARCHAR(1000) NOT NULL,
    [Customer_Id] INT,
    [Supplier_Id] INT,
    CONSTRAINT [Returns_pkey] PRIMARY KEY CLUSTERED ([Return_Id])
);

-- CreateTable
CREATE TABLE [dbo].[Return_Items] (
    [Return_Id] INT NOT NULL,
    [Item_Id] INT NOT NULL,
    [Quantity] INT NOT NULL,
    [Price] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [Return_Items_pkey] PRIMARY KEY CLUSTERED ([Return_Id],[Item_Id])
);

-- CreateTable
CREATE TABLE [dbo].[Stock_Movement] (
    [Movement_Id] INT NOT NULL IDENTITY(1,1),
    [Item_Id] INT NOT NULL,
    [Movement_Type] NVARCHAR(1000) NOT NULL,
    [Quantity] INT NOT NULL,
    [Movement_Date] DATETIME2 NOT NULL,
    [Invoice_Id] INT,
    [Return_Id] INT,
    CONSTRAINT [Stock_Movement_pkey] PRIMARY KEY CLUSTERED ([Movement_Id])
);

-- CreateTable
CREATE TABLE [dbo].[Payments] (
    [Payment_Id] INT NOT NULL IDENTITY(1,1),
    [Invoice_Id] INT NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Payment_Date] DATETIME2 NOT NULL,
    [Payment_Method] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Payments_pkey] PRIMARY KEY CLUSTERED ([Payment_Id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Invoices_Customer_Id_idx] ON [dbo].[Invoices]([Customer_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Invoices_Supplier_Id_idx] ON [dbo].[Invoices]([Supplier_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Invoices_Invoice_Date_idx] ON [dbo].[Invoices]([Invoice_Date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Invoice_Terms_Item_Id_idx] ON [dbo].[Invoice_Terms]([Item_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Returns_Invoice_Id_idx] ON [dbo].[Returns]([Invoice_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Returns_Customer_Id_idx] ON [dbo].[Returns]([Customer_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Returns_Supplier_Id_idx] ON [dbo].[Returns]([Supplier_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Return_Items_Item_Id_idx] ON [dbo].[Return_Items]([Item_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Stock_Movement_Item_Id_idx] ON [dbo].[Stock_Movement]([Item_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Stock_Movement_Invoice_Id_idx] ON [dbo].[Stock_Movement]([Invoice_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Stock_Movement_Return_Id_idx] ON [dbo].[Stock_Movement]([Return_Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Stock_Movement_Movement_Date_idx] ON [dbo].[Stock_Movement]([Movement_Date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Payments_Invoice_Id_idx] ON [dbo].[Payments]([Invoice_Id]);

-- AddForeignKey
ALTER TABLE [dbo].[Invoices] ADD CONSTRAINT [Invoices_Customer_Id_fkey] FOREIGN KEY ([Customer_Id]) REFERENCES [dbo].[Customers]([Customer_id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoices] ADD CONSTRAINT [Invoices_Supplier_Id_fkey] FOREIGN KEY ([Supplier_Id]) REFERENCES [dbo].[Suppliers]([supplier_id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoice_Terms] ADD CONSTRAINT [Invoice_Terms_Invoice_Id_fkey] FOREIGN KEY ([Invoice_Id]) REFERENCES [dbo].[Invoices]([Invoice_Id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoice_Terms] ADD CONSTRAINT [Invoice_Terms_Item_Id_fkey] FOREIGN KEY ([Item_Id]) REFERENCES [dbo].[Items]([Item_Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Returns] ADD CONSTRAINT [Returns_Invoice_Id_fkey] FOREIGN KEY ([Invoice_Id]) REFERENCES [dbo].[Invoices]([Invoice_Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Returns] ADD CONSTRAINT [Returns_Customer_Id_fkey] FOREIGN KEY ([Customer_Id]) REFERENCES [dbo].[Customers]([Customer_id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Returns] ADD CONSTRAINT [Returns_Supplier_Id_fkey] FOREIGN KEY ([Supplier_Id]) REFERENCES [dbo].[Suppliers]([supplier_id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Return_Items] ADD CONSTRAINT [Return_Items_Return_Id_fkey] FOREIGN KEY ([Return_Id]) REFERENCES [dbo].[Returns]([Return_Id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Return_Items] ADD CONSTRAINT [Return_Items_Item_Id_fkey] FOREIGN KEY ([Item_Id]) REFERENCES [dbo].[Items]([Item_Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Stock_Movement] ADD CONSTRAINT [Stock_Movement_Item_Id_fkey] FOREIGN KEY ([Item_Id]) REFERENCES [dbo].[Items]([Item_Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Stock_Movement] ADD CONSTRAINT [Stock_Movement_Invoice_Id_fkey] FOREIGN KEY ([Invoice_Id]) REFERENCES [dbo].[Invoices]([Invoice_Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Stock_Movement] ADD CONSTRAINT [Stock_Movement_Return_Id_fkey] FOREIGN KEY ([Return_Id]) REFERENCES [dbo].[Returns]([Return_Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Payments] ADD CONSTRAINT [Payments_Invoice_Id_fkey] FOREIGN KEY ([Invoice_Id]) REFERENCES [dbo].[Invoices]([Invoice_Id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
