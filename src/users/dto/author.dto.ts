import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export default class AuthorDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    @IsEmail()
    readonly email: string;
}