/* Copyright (c) 2022 uni-verse corp */

import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ModelType } from './create-comment.dto';

export class FindResourceCommentDto {
  @IsNotEmpty()
  @IsString()
  readonly contentId: string;

  @IsNotEmpty()
  @IsEnum(ModelType)
  readonly typeOfContent: ModelType;
}
