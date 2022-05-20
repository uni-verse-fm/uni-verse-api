import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum FileMimeType {
  MPEG = 'audio/mpeg',
  WAV = 'audio/vnd.wav',
}
export class SimpleCreateFileDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly originalFileName: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1024)
  readonly buffer: Buffer;

  @IsNotEmpty()
  @IsNumber()
  readonly size: number;

  @IsNotEmpty()
  @IsEnum(FileMimeType)
  readonly mimetype: FileMimeType;
}
