import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum DonationAmount {
  One = 1000,
  Two = 2000,
  Three = 3000,
  Five = 5000,
  Ten = 10000,
}

export class DonateDto {
  @IsEnum(DonationAmount)
  @IsNotEmpty()
  amount: DonationAmount = DonationAmount.One;

  @IsString()
  @IsOptional()
  donationProductId: string;

  @IsString()
  @IsOptional()
  connectedAccountId: string;
}
