/* Copyright (c) 2022 uni-verse corp */

import { IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @Min(1)
  @Max(900)
  source: string;
}
