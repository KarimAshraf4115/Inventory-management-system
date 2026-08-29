import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto.js';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}