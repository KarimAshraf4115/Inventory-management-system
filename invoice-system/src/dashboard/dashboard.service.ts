import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Today's sales total
    const todaysSaleInvoices = await this.prisma.invoice.findMany({
      where: {
        invoiceType: 'sale',
        invoiceDate: { gte: startOfToday, lte: endOfToday },
      },
      include: { invoiceTerms: true },
    });
    const todaysSales = todaysSaleInvoices.reduce(
      (sum, inv) =>
        sum + inv.invoiceTerms.reduce((s, t) => s + Number(t.price) * t.quantity, 0),
      0,
    );

    // 2. Current stock value (quantity * purchase price, per item)
    const items = await this.prisma.item.findMany();
    const stockValue = items.reduce(
      (sum, item) => sum + item.currentQuantity * Number(item.purchasePrice),
      0,
    );

    // 3. Low-stock count (reuse same threshold logic as Items module)
    const LOW_STOCK_THRESHOLD = 10;
    const lowStockCount = items.filter(
      (item) => item.currentQuantity < LOW_STOCK_THRESHOLD,
    ).length;

    // 4. Total receivable from customers (sales - returns - payments, across ALL sale invoices)
    const saleInvoices = await this.prisma.invoice.findMany({
      where: { invoiceType: 'sale' },
      include: {
        invoiceTerms: true,
        payments: true,
        returns: { include: { returnItems: true } },
      },
    });

    let totalReceivable = 0;
    for (const inv of saleInvoices) {
      const invTotal = inv.invoiceTerms.reduce((s, t) => s + Number(t.price) * t.quantity, 0);
      const retTotal = inv.returns.reduce(
        (s, r) => s + r.returnItems.reduce((rs, ri) => rs + Number(ri.price) * ri.quantity, 0),
        0,
      );
      const paidTotal = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
      totalReceivable += invTotal - retTotal - paidTotal;
    }

    return {
      todaysSales,
      stockValue,
      lowStockCount,
      totalReceivable,
    };
  }
}