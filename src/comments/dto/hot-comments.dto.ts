import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class HotCommentsDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
