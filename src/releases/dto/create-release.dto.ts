import { Request } from "express";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

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
}
