import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateViewDto {
  @IsMongoId()
  @IsNotEmpty()
  trackId: string;
}
