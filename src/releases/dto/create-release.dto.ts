import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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
  readonly coverUrl: string;

  @IsArray()
  @IsOptional()
  readonly feats?: AuthorDto[];

  @IsArray()
  @IsNotEmpty()
  readonly tracks: CreateReleseTrackDto[];
}

export class CreateReleseTrackDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    readonly title: string;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(1024)
    readonly trackFileName: string;
  
    @IsNotEmpty()
    readonly author: AuthorDto;
  
    @IsArray()
    @IsOptional()
    readonly feats?: AuthorDto[];
  }

