import { IsString, IsNotEmpty, IsInt, IsArray, IsOptional, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReturnItemDto } from './create-return-item.dto.js';

export class CreateReturnDto {
  @IsInt()
  invoiceId: number; // The original invoice being returned

  @IsString()
  @IsNotEmpty()
  returnType: string; // 'from_customer' or 'to_supplier'

  //If from_customer, Customer is required
  @ValidateIf((o) => o.returnType === 'from_customer')
  @IsInt()
  customerId?: number;

  // If to_supplier, Supplier is required
  @ValidateIf((o) => o.returnType === 'to_supplier')
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReturnItemDto)
  items: CreateReturnItemDto[];
}