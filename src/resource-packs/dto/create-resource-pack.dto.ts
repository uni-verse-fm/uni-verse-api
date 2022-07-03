/* Copyright (c) 2022 uni-verse corp */

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import AuthorDto from '../../users/dto/author.dto';

export enum AccessType {
  Free = 'free',
  Paid = 'paid',
  Donation = 'donation',
}
export class CreateResourcePackDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly description: string;

  @IsNotEmpty()
  @IsEnum(AccessType)
  readonly accessType: AccessType;

  @IsOptional()
  @IsNumber()
  readonly amount?: number;

  @IsArray()
  @IsNotEmpty()
  readonly resources: CreateReleaseResourceDto[];
}

export class CreateReleaseResourceDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly originalFileName: string;

  @IsNotEmpty()
  readonly author: AuthorDto;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly previewFileName: string;
}
