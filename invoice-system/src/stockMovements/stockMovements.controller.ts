import { Controller, Get, Query } from '@nestjs/common';
import { StockMovementsService } from './stockMovements.service.js';

@Controller('api/stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.stockMovementsService.findAll({ search, from, to });
  }
}