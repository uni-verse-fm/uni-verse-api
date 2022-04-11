import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserDocument } from '../../users/schemas/user.schema';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  readonly resourceFileName: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1024)
  readonly buffer: Buffer;

  @IsNotEmpty()
  readonly author: UserDocument;
}
