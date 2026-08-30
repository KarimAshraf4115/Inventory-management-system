import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
interface InvoiceFilters {
  invoiceNum?: string;
  invoiceType?: string;
  from?: string;
  to?: string;
}
@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    // 1. Validate Business Rules (XOR)
    if (dto.invoiceType === 'sale' && (!dto.customerId || dto.supplierId)) {
      throw new BadRequestException(
        'Sale invoices must have a CustomerId and no SupplierId.',
      );
    }
    if (dto.invoiceType === 'purchase' && (!dto.supplierId || dto.customerId)) {
      throw new BadRequestException(
        'Purchase invoices must have a SupplierId and no CustomerId.',
      );
    }

    // 3. Execute Transaction (The Automation Logic)
    return this.prisma.$transaction(async (tx) => {
      // Create the Invoice and its Terms
      const invoice = await tx.invoice.create({
        data: {
          invoiceNum: dto.invoiceNum,
          invoiceType: dto.invoiceType,
          customerId: dto.customerId,
          supplierId: dto.supplierId,
          invoiceDate: new Date(),
          invoiceTerms: {
            create: dto.terms.map((t) => ({
              itemId: t.itemId,
              quantity: t.quantity,
              price: t.price,
            })),
          },
        },
        include: { invoiceTerms: true },
      });

      const stockMovementsData = [];
      const itemIds = dto.terms.map((t) => t.itemId);
      const items = await tx.item.findMany({
        where: { itemId: { in: itemIds } },
      });
      const itemMap = new Map(items.map((i) => [i.itemId, i]));

      // Loop through terms to update stock and prepare stock movements
      for (const term of dto.terms) {
        const item = itemMap.get(term.itemId);

        if (!item) {
          throw new NotFoundException(`Item ID ${term.itemId} not found`);
        }

        if (
          dto.invoiceType === 'sale' &&
          item.currentQuantity < term.quantity
        ) {
          throw new BadRequestException(
            `Insufficient stock for ${item.name}. Available: ${item.currentQuantity}, Requested: ${term.quantity}`,
          );
        }

        let newQty: number;
        let movementType: string;

        if (dto.invoiceType === 'sale') {
          newQty = item.currentQuantity - term.quantity;
          movementType = 'sale_out';
        } else {
          newQty = item.currentQuantity + term.quantity;
          movementType = 'purchase_in';
        }

        // Update the cached stock quantity
        await tx.item.update({
          where: { itemId: term.itemId },
          data: { currentQuantity: newQty },
        });

        // Prepare the audit log record
        stockMovementsData.push({
          itemId: term.itemId,
          movementType: movementType,
          quantity: term.quantity,
          movementDate: new Date(),
          invoiceId: invoice.invoiceId,
        });
      }

      // Batch create all stock movements
      await tx.stockMovement.createMany({ data: stockMovementsData });

      return invoice;
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceId: id },
      include: {
        invoiceTerms: { include: { item: true } },
        customer: true,
        supplier: true,
        payments: true,
        returns: { include: { returnItems: true } },
      },
    });

    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

    // Calculate Derived Attributes (Totals & Balances)
    const invoiceTotal = invoice.invoiceTerms.reduce(
      (sum, term) => sum + Number(term.price) * term.quantity,
      0,
    );
    const amountPaid = invoice.payments.reduce(
      (sum, pay) => sum + Number(pay.amount),
      0,
    );
    const returnTotal = invoice.returns.reduce((acc, ret) => {
      return (
        acc +
        ret.returnItems.reduce((s, ri) => s + Number(ri.price) * ri.quantity, 0)
      );
    }, 0);

    return {
      ...invoice,
      derivedInvoiceTotal: invoiceTotal,
      derivedAmountPaid: amountPaid,
      derivedReturnTotal: returnTotal,
      // Outstanding = Total - Returns - Payments
      derivedOutstandingBalance: invoiceTotal - returnTotal - amountPaid,
    };
  }

  async findAll(filters: InvoiceFilters) {
    const { invoiceNum, invoiceType, from, to } = filters;

    const invoices = await this.prisma.invoice.findMany({
      where: {
        invoiceNum: invoiceNum
          ? { contains: invoiceNum, mode: 'insensitive' }
          : undefined,
        invoiceType: invoiceType || undefined,
        invoiceDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        customer: true,
        supplier: true,
        invoiceTerms: true,
        payments: true,
        returns: { include: { returnItems: true } },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    return invoices.map((inv) => {
      const total = inv.invoiceTerms.reduce(
        (s, t) => s + Number(t.price) * t.quantity,
        0,
      );
      const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
      const returned = inv.returns.reduce(
        (s, r) =>
          s +
          r.returnItems.reduce(
            (rs, ri) => rs + Number(ri.price) * ri.quantity,
            0,
          ),
        0,
      );
      const remaining = total - returned - paid;

      let status: string;
      if (remaining <= 0) status = 'paid';
      else if (paid > 0) status = 'partial';
      else status = 'unpaid';

      return {
        invoiceId: inv.invoiceId,
        invoiceNum: inv.invoiceNum,
        invoiceType: inv.invoiceType,
        invoiceDate: inv.invoiceDate,
        customerId: inv.customerId,
        supplierId: inv.supplierId,
        partyName: inv.customer?.name ?? inv.supplier?.name ?? null,
        total,
        paid,
        remaining,
        status,
      };
    });
  }
}
