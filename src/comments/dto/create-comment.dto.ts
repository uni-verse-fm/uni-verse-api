import { IsNotEmpty, IsString, MinLength, MaxLength, IsBoolean, IsEnum } from "class-validator";

export enum ModelType {
    TRACK = 'Track',
    RESOURCE = 'Resource',
}

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    readonly contentId: string;

    @IsNotEmpty()
    @IsBoolean()
    readonly isPositive: boolean;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(1024)
    readonly content: string;
  
    @IsNotEmpty()
    @IsEnum(ModelType)
    readonly typeOfContent: ModelType;
}
