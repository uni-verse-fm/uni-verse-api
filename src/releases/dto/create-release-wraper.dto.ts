import { IsNotEmpty } from 'class-validator';
import { CreateReleaseDto } from './create-release.dto';

export class CreateReleaseWraperDto {
  @IsNotEmpty()
  data: CreateReleaseDto;
}
