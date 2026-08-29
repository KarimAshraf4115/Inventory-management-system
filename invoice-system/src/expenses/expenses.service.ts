import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.expense.findMany({
      where: search
        ? {
            OR: [
              { type: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { expenseDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const expense = await this.prisma.expense.findUnique({ where: { expenseId: id } });
    if (!expense) throw new NotFoundException(`Expense ${id} not found`);
    return expense;
  }

  async create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        expenseDate: new Date(),
      },
    });
  }

  async update(id: number, dto: UpdateExpenseDto) {
    await this.findOne(id); // throws 404 if missing
    return this.prisma.expense.update({
      where: { expenseId: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.expense.delete({ where: { expenseId: id } });
  }
}