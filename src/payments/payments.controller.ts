import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CheckoutDto } from './dto/checkout.dto';
import { DonateDto } from './dto/create-donate.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/donate')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Make a donation' })
  async donate(
    @Body() donate: DonateDto,
    @Request() request: IRequestWithUser,
    @Res() response: ExpressResponse,
  ) {
    const donateUrl = await this.paymentsService.donate(
      donate.amount,
      request.user.donationProductId,
      donate.connectedAccountId,
    );
    return response.json({ donateUrl });
  }

  @Post('/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Make a purshase' })
  checkout(@Body() checkout: CheckoutDto) {
    return this.paymentsService.checkout(
      checkout.priceId,
      checkout.connectedAccountId,
    );
  }

  @Get('/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Refresh stripe onboarding' })
  async refresh(
    @Request() request: IRequestWithUser,
    @Res() response: ExpressResponse,
  ) {
    const onboardUrl = await this.paymentsService.refreshOnboardLink(request);
    return response.json({ onboardUrl });
  }

  @Get('/account/me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find my account' })
  findMyAccount(@Request() request: IRequestWithUser) {
    return this.paymentsService.findAccount(request.user.stripeAccountId);
  }

}
