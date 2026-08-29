import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const customers = await this.prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phoneNum: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { customerId: 'desc' },
    });

    // Attach balance to every customer in the list
    const withBalances = await Promise.all(
      customers.map(async (customer) => {
        const { balance } = await this.calculateBalance(customer.customerId);
        return { ...customer, balance };
      }),
    );

    return withBalances;
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customerId: id },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(dto: CreateCustomerDto) {
  try {
    return await this.prisma.customer.create({
      data: {
        name: dto.name,
        phoneNum: dto.phoneNum,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A customer with this phone number already exists.',
      );
    }
    throw error;
  }
}

  async update(id: number, dto: UpdateCustomerDto) {
  await this.findOne(id);
  try {
    return await this.prisma.customer.update({
      where: { customerId: id },
      data: dto,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A customer with this phone number already exists.',
      );
    }
    throw error;
  }
}

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.customer.delete({ where: { customerId: id } });
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
      where: { customerId: id, invoiceType: 'sale' },
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

    const balance = totalInvoices - totalReturns - totalPayments;

    return {
      customerId: id,
      totalInvoices,
      totalReturns,
      totalPayments,
      balance,
    };
  }
}