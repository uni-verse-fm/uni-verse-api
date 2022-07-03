/* Copyright (c) 2022 uni-verse corp */

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  Res,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CheckoutDto } from './dto/checkout.dto';
import { DonateDto } from './dto/create-donate.dto';
import RequestWithRawBody from './interfaces/request-with-raw-body.interface';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger: Logger = new Logger(PaymentsController.name);
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/donate')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Make a donation' })
  async donate(
    @Body() donate: DonateDto,
    @Request() request: IRequestWithUser,
    @Res() response: Response,
  ) {
    const donateUrl = await this.paymentsService.donate(
      donate.amount,
      donate.donationProductId,
      request.user.id,
      donate.connectedAccountId,
    );
    return response.json({ donateUrl });
  }

  @Post('/purshase')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Make a purshase' })
  checkout(
    @Body() checkout: CheckoutDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.paymentsService.purshase(
      request.user.id,
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
    @Res() response: Response,
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

  @Post('/webhook')
  @ApiExcludeEndpoint()
  async stripeWebHook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
    @Res() response: Response,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const event = await this.paymentsService.constructEventFromPayload(
      signature,
      request.rawBody,
    );
    return await this.paymentsService
      .handleWebHook(event)
      .then(() => response.sendStatus(200));
  }
}
