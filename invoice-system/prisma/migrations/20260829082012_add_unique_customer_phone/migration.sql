/*
  Warnings:

  - A unique constraint covering the columns `[Phone_Num]` on the table `Customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Phone-Num]` on the table `Suppliers` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[Customers] ADD CONSTRAINT [Customers_Phone_Num_key] UNIQUE NONCLUSTERED ([Phone_Num]);

-- CreateIndex
ALTER TABLE [dbo].[Suppliers] ADD CONSTRAINT [Suppliers_Phone-Num_key] UNIQUE NONCLUSTERED ([Phone-Num]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
