/* Copyright (c) 2022 uni-verse corp */

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SimpleCreateFileDto } from '../../files/dto/simple-create-file.dto';
import AuthorDto from '../../users/dto/author.dto';
import { UserDocument } from '../../users/schemas/user.schema';

export class CreateTrackDto {
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
  readonly file: SimpleCreateFileDto;

  @IsNotEmpty()
  readonly author: UserDocument;

  @IsArray()
  @IsOptional()
  readonly feats?: AuthorDto[];
}
