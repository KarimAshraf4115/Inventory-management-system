BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Expenses] (
    [Expense_Id] INT NOT NULL IDENTITY(1,1),
    [Type] NVARCHAR(1000) NOT NULL,
    [Amount] DECIMAL(18,2) NOT NULL,
    [Expense_Date] DATETIME2 NOT NULL,
    [Description] NVARCHAR(1000),
    CONSTRAINT [Expenses_pkey] PRIMARY KEY CLUSTERED ([Expense_Id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Expenses_Expense_Date_idx] ON [dbo].[Expenses]([Expense_Date]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
