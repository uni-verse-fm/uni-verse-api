import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CreateDonateDto } from './dto/create-donate.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('/donate')
  @UseGuards(JwtAuthGuard)
  donate(
    @Body() payement: CreateDonateDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.paymentsService.donate({
      customerId: request.user.stripeCustomerId,
      ...payement,
    });
  }

  @Post('/charge')
  @UseGuards(JwtAuthGuard)
  charge(
    @Body() payement: CreatePaymentDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.paymentsService.buyResourcePack({
      customerId: request.user.stripeCustomerId,
      ...payement,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllPayments(@Request() request: IRequestWithUser) {
    return this.paymentsService.findAllPayments(request.user.stripeCustomerId);
  }

  @Get(':id')
  findOnePayment(
    @Param('id') payementId: string,
    @Request() request: IRequestWithUser,
  ) {
    return this.paymentsService.findOnePayementById(
      request.user.stripeCustomerId,
      payementId,
    );
  }
}
