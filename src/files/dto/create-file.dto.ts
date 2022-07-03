/* Copyright (c) 2022 uni-verse corp */

import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  files: Array<Express.Multer.File>;
}
