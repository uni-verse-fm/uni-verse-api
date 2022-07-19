import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsEnum,
  IsMongoId,
} from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  dest: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly content: string;
}
