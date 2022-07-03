/* Copyright (c) 2022 uni-verse corp */

import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsString()
  @IsNotEmpty()
  connectedAccountId: string;
}
