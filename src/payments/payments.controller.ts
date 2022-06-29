import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  Req,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';
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
  stripeWebHook(@Req() request: ExpressRequest, @Res() response: Response) {
    const sig = request.headers['stripe-signature'];
    this.paymentsService.handleWebHook(request.body, sig);
    return response.send();
  }
}
