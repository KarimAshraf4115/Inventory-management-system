import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReturnDto } from './dto/create-return.dto.js';

interface ReturnFilters {
  invoiceId?: number;
  returnType?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReturnDto) {
    // 1. Fetch the original invoice to validate the return
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceId: dto.invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);
    }

    // 2. Business Rule: Return type must match the original invoice type
    if (invoice.invoiceType === 'sale' && dto.returnType !== 'from_customer') {
      throw new BadRequestException(
        'Sale invoices can only have returns "from_customer".',
      );
    }
    if (
      invoice.invoiceType === 'purchase' &&
      dto.returnType !== 'to_supplier'
    ) {
      throw new BadRequestException(
        'Purchase invoices can only have returns "to_supplier".',
      );
    }

    // 3. Validate XOR and ensure the party matches the original invoice
    if (dto.returnType === 'from_customer') {
      if (!dto.customerId || dto.supplierId)
        throw new BadRequestException(
          'Customer returns must have a CustomerId and no SupplierId.',
        );
      if (invoice.customerId !== dto.customerId)
        throw new BadRequestException(
          'Customer does not match the original invoice.',
        );
    } else {
      if (!dto.supplierId || dto.customerId)
        throw new BadRequestException(
          'Supplier returns must have a SupplierId and no CustomerId.',
        );
      if (invoice.supplierId !== dto.supplierId)
        throw new BadRequestException(
          'Supplier does not match the original invoice.',
        );
    }

    // Validate returned quantities don't exceed what was on the original invoice
    const originalTerms = await this.prisma.invoiceTerm.findMany({
      where: { invoiceId: dto.invoiceId },
    });
    const originalMap = new Map(
      originalTerms.map((t) => [t.itemId, t.quantity]),
    );

    // Sum up quantities already returned on this invoice, per item
    const priorReturns = await this.prisma.returnItem.findMany({
      where: { return: { invoiceId: dto.invoiceId } },
    });
    const alreadyReturnedMap = new Map<number, number>();
    for (const ri of priorReturns) {
      alreadyReturnedMap.set(
        ri.itemId,
        (alreadyReturnedMap.get(ri.itemId) ?? 0) + ri.quantity,
      );
    }

    for (const item of dto.items) {
      const maxQty = originalMap.get(item.itemId);
      if (maxQty === undefined) {
        throw new BadRequestException(
          `Item ${item.itemId} was not part of the original invoice.`,
        );
      }
      const alreadyReturned = alreadyReturnedMap.get(item.itemId) ?? 0;
      const remaining = maxQty - alreadyReturned;
      if (item.quantity > remaining) {
        throw new BadRequestException(
          `Cannot return ${item.quantity} of item ${item.itemId}; only ${remaining} remain returnable (out of ${maxQty} original).`,
        );
      }
    }

    // 5. Execute Transaction (The Automation Logic)
    return this.prisma.$transaction(async (tx) => {
      // Create the Return header and ReturnItems
      const returnRecord = await tx.return.create({
        data: {
          invoiceId: dto.invoiceId,
          returnType: dto.returnType,
          customerId: dto.customerId,
          supplierId: dto.supplierId,
          reason: dto.reason,
          returnDate: new Date(),
          returnItems: {
            create: dto.items.map((i) => ({
              itemId: i.itemId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
        include: { returnItems: true },
      });

      const stockMovementsData = [];

      const itemIds = dto.items.map((i) => i.itemId);
      const dbItems = await tx.item.findMany({
        where: { itemId: { in: itemIds } },
      });
      const itemMap = new Map(dbItems.map((i) => [i.itemId, i]));

      // Loop through items to update stock and prepare stock movements
      for (const item of dto.items) {
        const dbItem = itemMap.get(item.itemId);
        if (!dbItem)
          throw new NotFoundException(`Item ID ${item.itemId} not found`);

        if (
          dto.returnType === 'to_supplier' &&
          dbItem.currentQuantity < item.quantity
        ) {
          throw new BadRequestException(
            `Insufficient stock to return to supplier. Available: ${dbItem.currentQuantity}, Requested: ${item.quantity}`,
          );
        }

        let newQty: number;
        let movementType: string;

        if (dto.returnType === 'from_customer') {
          // Customer return: stock comes BACK to us
          newQty = dbItem.currentQuantity + item.quantity;
          movementType = 'sale_return_in';
        } else {
          // Supplier return: stock goes BACK to them
          newQty = dbItem.currentQuantity - item.quantity;
          movementType = 'purchase_return_out';
        }

        // Update the cached stock quantity
        await tx.item.update({
          where: { itemId: item.itemId },
          data: { currentQuantity: newQty },
        });

        // Prepare the audit log record
        stockMovementsData.push({
          itemId: item.itemId,
          movementType: movementType,
          quantity: item.quantity,
          movementDate: new Date(),
          returnId: returnRecord.returnId,
        });
      }

      // Batch create all stock movements
      await tx.stockMovement.createMany({ data: stockMovementsData });

      return returnRecord;
    });
  }

  async findOne(id: number) {
    const returnRecord = await this.prisma.return.findUnique({
      where: { returnId: id },
      include: {
        returnItems: { include: { item: true } },
        invoice: true,
        customer: true,
        supplier: true,
      },
    });

    if (!returnRecord) throw new NotFoundException(`Return ${id} not found`);

    // Calculate Derived Attribute (Return Total)
    const returnTotal = returnRecord.returnItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      ...returnRecord,
      derivedReturnTotal: returnTotal,
    };
  }

  async findAll(filters: ReturnFilters) {
    const { invoiceId, returnType, from, to } = filters;

    const returns = await this.prisma.return.findMany({
      where: {
        invoiceId: invoiceId || undefined,
        returnType: returnType || undefined,
        returnDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        customer: true,
        supplier: true,
        invoice: true,
        returnItems: true,
      },
      orderBy: { returnId: 'desc' },
    });

    return returns.map((r) => {
      const derivedReturnTotal = r.returnItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      return { ...r, derivedReturnTotal };
    });
  }
}
