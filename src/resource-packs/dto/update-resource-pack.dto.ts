import { PartialType } from '@nestjs/swagger';
import { CreateResourcePackDto } from './create-resource-pack.dto';

export class UpdateResourcePackDto extends PartialType(CreateResourcePackDto) {}
