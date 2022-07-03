/* Copyright (c) 2022 uni-verse corp */

import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateFpSearchDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  foundTrackFileName: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  takenTime: number;
}
