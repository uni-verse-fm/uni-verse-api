import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import AuthorDto from "../../users/dto/author.dto";

export class CreateTrackDto {
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
    @MinLength(1)
    @MaxLength(1024)
    readonly buffer: Buffer;

    @IsNotEmpty()
    readonly author: AuthorDto;

    @IsArray()
    @IsOptional()
    readonly feats?: AuthorDto[];
}