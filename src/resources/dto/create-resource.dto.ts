/* Copyright (c) 2022 uni-verse corp */

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SimpleCreateFileDto } from '../../files/dto/simple-create-file.dto';
import { UserDocument } from '../../users/schemas/user.schema';

export class CreateResourceDto {
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

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly previewFileName?: string;

  @IsNotEmpty()
  readonly file: SimpleCreateFileDto;

  @IsOptional()
  readonly previewFile?: SimpleCreateFileDto;

  @IsNotEmpty()
  readonly author: UserDocument;
}
