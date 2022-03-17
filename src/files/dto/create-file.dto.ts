import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateFileDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    readonly fileName: string;
  
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(1024)
    readonly buffer: Buffer;
}