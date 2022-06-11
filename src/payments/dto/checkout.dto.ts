import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  connectedAccountId: string;
}
