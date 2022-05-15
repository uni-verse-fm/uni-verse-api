import { PartialType } from '@nestjs/swagger';
import { CreateDonateDto } from './create-donate.dto';

export class UpdatePayementDto extends PartialType(CreateDonateDto) {}
