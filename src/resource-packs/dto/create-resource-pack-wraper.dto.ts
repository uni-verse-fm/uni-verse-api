import { IsNotEmpty } from 'class-validator';
import { CreateResourcePackDto } from './create-resource-pack.dto';

export class CreateResourcePackWraperDto {
  @IsNotEmpty()
  data: CreateResourcePackDto;
}
