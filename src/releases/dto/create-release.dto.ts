import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateTrackDto } from '../../tracks/dto/create-track.dto';
import AuthorDto from '../../users/dto/author.dto';

export class CreateReleaseDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly coverFileName: string;

  @IsArray()
  @IsOptional()
  readonly feats?: AuthorDto[];

  @IsArray()
  @IsNotEmpty()
  readonly tracks: CreateTrackDto[];
}
