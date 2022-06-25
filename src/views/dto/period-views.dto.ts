import { IsDate, IsMongoId, IsNotEmpty } from "class-validator";

export class PeriodViewsDto {
    @IsMongoId()
    @IsNotEmpty()
    trackId: string;

    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @IsDate()
    @IsNotEmpty()
    endDate: Date;
}