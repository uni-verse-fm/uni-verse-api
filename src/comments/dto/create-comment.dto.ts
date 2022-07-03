/* Copyright (c) 2022 uni-verse corp */

import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum ModelType {
  Track = 'Track',
  Resource = 'Resource',
}

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  readonly contentId: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly isPositive: boolean;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly content: string;

  @IsNotEmpty()
  @IsEnum(ModelType)
  readonly typeOfContent: ModelType;
}
