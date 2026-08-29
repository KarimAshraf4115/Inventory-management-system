import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceTermDto } from './create-invoice-term.dto.js';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNum: string;

  @IsString()
  @IsNotEmpty()
  invoiceType: string; // 'sale' or 'purchase'

  //  If Sale, Customer is required, Supplier must be null
  @ValidateIf((o) => o.invoiceType === 'sale')
  @IsInt()
  customerId?: number;

  // If Purchase, Supplier is required, Customer must be null
  @ValidateIf((o) => o.invoiceType === 'purchase')
  @IsInt()
  supplierId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceTermDto)
  terms: CreateInvoiceTermDto[];
}
