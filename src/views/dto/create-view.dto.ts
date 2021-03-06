/* Copyright (c) 2022 uni-verse corp */

import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateViewDto {
  @IsMongoId()
  @IsNotEmpty()
  track: string;

  @IsMongoId()
  @IsOptional()
  user?: string;
}
