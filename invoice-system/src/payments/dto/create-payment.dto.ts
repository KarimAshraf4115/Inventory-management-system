import { IsInt, IsNumber, IsString, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  invoiceId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // "Cash", "Credit Card", "Bank Transfer"

  @IsOptional()
  @IsString()
  notes?: string;
}
