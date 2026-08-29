// src/items/dto/update-item.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto.js';

export class UpdateItemDto extends PartialType(CreateItemDto) {}