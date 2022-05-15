import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDonateDto {
  @IsString()
  paymentMethodId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(900)
  amount: number;

  @IsBoolean()
  saveCard: boolean;
}
