import { PartialType } from '@nestjs/swagger';
import { CreateReleaseDto } from './create-release.dto';

export class UpdateReleaseDto extends PartialType(CreateReleaseDto) {}
