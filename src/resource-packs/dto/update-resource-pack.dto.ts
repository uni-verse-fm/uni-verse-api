import { PartialType } from '@nestjs/mapped-types';
import { CreateResourcePackDto } from './create-resource-pack.dto';

export class UpdateResourcePackDto extends PartialType(CreateResourcePackDto) {}
