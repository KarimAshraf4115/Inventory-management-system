import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateInvoiceTermDto {
  @IsInt()
  itemId: number;

  @IsInt()
  @Min(1) // Quantity must be at least 1
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}