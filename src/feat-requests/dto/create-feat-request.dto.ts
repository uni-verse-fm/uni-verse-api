import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateFeatRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  user: string;

  @IsMongoId()
  @IsNotEmpty()
  dest: string;

  @IsMongoId()
  @IsNotEmpty()
  track: string;
}
