/* Copyright (c) 2022 uni-verse corp */

import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePlaylistDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  readonly title: string;
}
