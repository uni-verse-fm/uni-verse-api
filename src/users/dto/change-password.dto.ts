/* Copyright (c) 2022 uni-verse corp */

import { IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(1024)
  readonly password: string;
}
