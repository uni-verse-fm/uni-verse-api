/* Copyright (c) 2022 uni-verse corp */

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import AuthorDto from 'src/users/dto/author.dto';

export class CreateFpSearchDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  readonly filename: string;

  @IsNotEmpty()
  @IsOptional()
  readonly author?: AuthorDto;
}
