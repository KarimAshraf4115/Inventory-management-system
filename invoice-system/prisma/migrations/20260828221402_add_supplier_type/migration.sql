/*
  Warnings:

  - You are about to alter the column `Name` on the `Customers` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(255)`.
  - You are about to alter the column `Phone_Num` on the `Customers` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(50)`.
  - You are about to alter the column `Type` on the `Expenses` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(255)`.
  - You are about to alter the column `Invoice_Num` on the `Invoices` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(100)`.
  - You are about to alter the column `Invoice_Type` on the `Invoices` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(50)`.
  - You are about to alter the column `Code` on the `Items` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(255)`.
  - You are about to alter the column `Name` on the `Items` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(255)`.
  - You are about to alter the column `Payment_Method` on the `Payments` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(50)`.
  - You are about to alter the column `Return_Type` on the `Returns` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(50)`.
  - You are about to alter the column `Movement_Type` on the `Stock_Movement` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(50)`.
  - You are about to alter the column `name` on the `Suppliers` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(255)`.
  - You are about to alter the column `Phone-Num` on the `Suppliers` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `NVarChar(50)`.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Invoices] DROP CONSTRAINT [Invoices_Invoice_Num_key];

-- DropIndex
ALTER TABLE [dbo].[Items] DROP CONSTRAINT [Items_Code_key];

-- AlterTable
ALTER TABLE [dbo].[Customers] ALTER COLUMN [Name] NVARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[Customers] ALTER COLUMN [Phone_Num] NVARCHAR(50) NULL;

-- AlterTable
ALTER TABLE [dbo].[Expenses] ALTER COLUMN [Type] NVARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Invoices] ALTER COLUMN [Invoice_Num] NVARCHAR(100) NOT NULL;
ALTER TABLE [dbo].[Invoices] ALTER COLUMN [Invoice_Type] NVARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Items] ALTER COLUMN [Code] NVARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[Items] ALTER COLUMN [Name] NVARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Payments] ALTER COLUMN [Payment_Method] NVARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Returns] ALTER COLUMN [Return_Type] NVARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Stock_Movement] ALTER COLUMN [Movement_Type] NVARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Suppliers] ALTER COLUMN [name] NVARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[Suppliers] ALTER COLUMN [Phone-Num] NVARCHAR(50) NULL;
ALTER TABLE [dbo].[Suppliers] ADD [Type] NVARCHAR(50);

-- CreateIndex
ALTER TABLE [dbo].[Items] ADD CONSTRAINT [Items_Code_key] UNIQUE NONCLUSTERED ([Code]);

-- CreateIndex
ALTER TABLE [dbo].[Invoices] ADD CONSTRAINT [Invoices_Invoice_Num_key] UNIQUE NONCLUSTERED ([Invoice_Num]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
