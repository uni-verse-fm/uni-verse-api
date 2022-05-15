import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  paymentMethodId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(900)
  amount: number;

  @IsString()
  @IsNotEmpty()
  targetCustomerId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsBoolean()
  saveCard: boolean;
}
