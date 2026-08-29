import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ItemsModule } from './items/items.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { ReturnsModule } from './returns/returns.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { StockMovementsModule } from './stockMovements/stockMovements.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
@Module({
  imports: [
    PrismaModule,
    ItemsModule,
    InvoicesModule,    
    CustomersModule,  
    SuppliersModule,
    ReturnsModule,
    PaymentsModule,
    ExpensesModule,
    StockMovementsModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}