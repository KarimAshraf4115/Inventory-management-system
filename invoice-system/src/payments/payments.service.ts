import { Injectable, NotFoundException , BadRequestException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.payment.findMany({
      include: { invoice: true },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { paymentId: id },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  async create(dto: CreatePaymentDto) {
    // Verify the invoice exists before attaching a payment
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceId: dto.invoiceId },
    });
    if (!invoice)
      throw new NotFoundException(`Invoice ${dto.invoiceId} not found`);

    const [terms, payments, returns] = await Promise.all([
      this.prisma.invoiceTerm.findMany({ where: { invoiceId: dto.invoiceId } }),
      this.prisma.payment.findMany({ where: { invoiceId: dto.invoiceId } }),
      this.prisma.return.findMany({
        where: { invoiceId: dto.invoiceId },
        include: { returnItems: true },
      }),
    ]);

    const invoiceTotal = terms.reduce(
      (sum, t) => sum + Number(t.price) * t.quantity,
      0,
    );
    const alreadyPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const returnTotal = returns.reduce(
      (sum, r) =>
        sum +
        r.returnItems.reduce((s, ri) => s + Number(ri.price) * ri.quantity, 0),
      0,
    );
    const remaining = invoiceTotal - returnTotal - alreadyPaid;

    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Payment exceeds remaining balance. Remaining: ${remaining}, Attempted: ${dto.amount}`,
      );
    }

    return this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        paymentDate: new Date(),
        notes: dto.notes,
      },
    });
  }

  async update(id: number, dto: UpdatePaymentDto) {
    await this.findOne(id); // throws 404 if missing
    return this.prisma.payment.update({
      where: { paymentId: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.payment.delete({ where: { paymentId: id } });
  }
}
