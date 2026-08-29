import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto.js';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}