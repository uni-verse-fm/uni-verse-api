import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateViewDto {
  @IsMongoId()
  @IsNotEmpty()
  track: string;

  @IsMongoId()
  @IsOptional()
  release: string;

  @IsMongoId()
  @IsOptional()
  user?: string;
}
