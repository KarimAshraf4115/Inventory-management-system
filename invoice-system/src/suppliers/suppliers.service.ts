import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const suppliers = await this.prisma.supplier.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search , mode: 'insensitive'} },
              { phoneNum: { contains: search , mode: 'insensitive'} },
            ],
          }
        : undefined,
      orderBy: { supplierId: 'desc' },
    });

    // Attach balance to every supplier in the list
    const withBalances = await Promise.all(
      suppliers.map(async (supplier) => {
        const { balance } = await this.calculateBalance(supplier.supplierId);
        return { ...supplier, balance };
      }),
    );

    return withBalances;
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { supplierId: id },
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
  try {
    return await this.prisma.supplier.create({
      data: {
        name: dto.name,
        phoneNum: dto.phoneNum,
        type: dto.type,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A supplier with this phone number already exists.',
      );
    }
    throw error;
  }
}

  async update(id: number, dto: UpdateSupplierDto) {
  await this.findOne(id);
  try {
    return await this.prisma.supplier.update({
      where: { supplierId: id },
      data: dto,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A supplier with this phone number already exists.',
      );
    }
    throw error;
  }
}

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.supplier.delete({ where: { supplierId: id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Cannot delete customer because they have existing invoices or returns.',
        );
      }
      throw error;
    }
  }

  // DERIVED ATTRIBUTE LOGIC

  async getBalance(id: number) {
    await this.findOne(id);
    return this.calculateBalance(id);
  }

  // Shared calculation used by both findAll() and getBalance(),
  // so the numbers can never drift apart between the list and single views.
  private async calculateBalance(id: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: { supplierId: id, invoiceType: 'purchase' },
      include: {
        invoiceTerms: true,
        payments: true,
        returns: { include: { returnItems: true } },
      },
    });

    let totalInvoices = 0;
    let totalReturns = 0;
    let totalPayments = 0;

    for (const inv of invoices) {
      const invTotal = inv.invoiceTerms.reduce(
        (sum, term) => sum + Number(term.price) * term.quantity,
        0,
      );
      totalInvoices += invTotal;

      const retTotal = inv.returns.reduce((retSum, ret) => {
        return (
          retSum +
          ret.returnItems.reduce(
            (s, ri) => s + Number(ri.price) * ri.quantity,
            0,
          )
        );
      }, 0);
      totalReturns += retTotal;

      const payTotal = inv.payments.reduce(
        (sum, pay) => sum + Number(pay.amount),
        0,
      );
      totalPayments += payTotal;
    }

    // Supplier Balance (Payable) = Total Purchases - Total Returns - Total Payments
    const balance = totalInvoices - totalReturns - totalPayments;

    return {
      supplierId: id,
      totalInvoices,
      totalReturns,
      totalPayments,
      balance, // If positive, we owe them. If negative, we overpaid them.
    };
  }
}