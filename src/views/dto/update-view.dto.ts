import { PartialType } from '@nestjs/swagger';
import { CreateViewDto } from './create-view.dto';

export class UpdateViewDto extends PartialType(CreateViewDto) {}
