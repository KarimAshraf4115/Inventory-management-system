import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

interface StockMovementFilters {
  search?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: StockMovementFilters) {
    const { search, from, to } = filters;

    return this.prisma.stockMovement.findMany({
      where: {
        item: search
          ? {
              OR: [
                { code: { contains: search } },
                { name: { contains: search } },
              ],
            }
          : undefined,
        movementDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: { item: true },
      orderBy: { movementDate: 'desc' },
    });
  }
}