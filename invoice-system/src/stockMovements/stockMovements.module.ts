import { Module } from '@nestjs/common';
import { StockMovementsController } from './stockMovements.controller.js';
import { StockMovementsService } from './stockMovements.service.js';

@Module({
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
})
export class StockMovementsModule {}