import { PartialType } from '@nestjs/swagger';
import { SimpleCreateFileDto } from './simple-create-file.dto';

export class UpdateFileDto extends PartialType(SimpleCreateFileDto) {}
