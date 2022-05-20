import {
  IsEnum,
  IsMimeType,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum FileMimeType {
  MPEG = 'audio/mpeg',
  WAV = 'audio/vnd.wav',
  PNG = 'image/png',
  JPEG = 'image/jpeg' 
}

type fileMimeType = 'audio/mpeg' | 'audio/vnd.wav' |'image/png' | 'image/jpeg'
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
  @IsMimeType()
  readonly mimetype: string;
}
