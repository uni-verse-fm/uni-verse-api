/* Copyright (c) 2022 uni-verse corp */

import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class HotViewsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
