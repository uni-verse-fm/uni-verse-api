import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum DonationAmount {
  Ten = 100,
  Twenty = 200,
  Thirty = 300,
}

export class DonateDto {
  @IsEnum(DonationAmount)
  @IsNotEmpty()
  amount: DonationAmount = DonationAmount.Ten;

  @IsString()
  @IsOptional()
  connectedAccountId: string;
}
