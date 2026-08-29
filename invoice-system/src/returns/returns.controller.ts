import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ReturnsService } from './returns.service.js';
import { CreateReturnDto } from './dto/create-return.dto.js';

@Controller('api/returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.returnsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.returnsService.findOne(id);
  }
  @Get()
  findAll(
    @Query('invoiceId') invoiceId?: string,
    @Query('returnType') returnType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.returnsService.findAll({
      invoiceId: invoiceId ? +invoiceId : undefined,
      returnType,
      from,
      to,
    });
  }
}
