import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto.js';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}