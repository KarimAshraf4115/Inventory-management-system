// src/items/items.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.item.findMany({
      where: search
        ? {
            OR: [
              { code: { contains: search } },
              { name: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { itemId: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({ where: { itemId: id } });
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return item;
  }

  async create(dto: CreateItemDto) {
    const existing = await this.prisma.item.findUnique({
      where: { code: dto.code },
    });
    if (existing)
      throw new ConflictException(`Item code "${dto.code}" already exists`);

    return this.prisma.item.create({
      data: {
        code: dto.code,
        name: dto.name,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        currentQuantity: dto.currentQuantity ?? 0,
      },
    });
  }

  async update(id: number, dto: UpdateItemDto) {
    await this.findOne(id);
    if (dto.code) {
      const existing = await this.prisma.item.findUnique({
        where: { code: dto.code },
      });
      if (existing && existing.itemId !== id) {
        throw new ConflictException(`Item code "${dto.code}" already exists`);
      }
    }
    return this.prisma.item.update({
      where: { itemId: id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.item.delete({ where: { itemId: id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Cannot delete item because it has existing invoice, return, or stock movement records.',
        );
      }
      throw error;
    }
  }

  async getMovements(id: number) {
    await this.findOne(id);
    return this.prisma.stockMovement.findMany({
      where: { itemId: id },
      orderBy: { movementDate: 'desc' },
    });
  }

  async getLowStock(threshold = 10) {
    return this.prisma.item.findMany({
      where: { currentQuantity: { lt: threshold } },
      orderBy: { currentQuantity: 'asc' },
    });
  }
}
