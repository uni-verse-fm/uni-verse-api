import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('donation/:destId')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Sum of donations made to a user' })
  sumuOfDonations(
    @Request() request: IRequestWithUser,
    @Param('destId') destId: string,
  ) {
    return this.transactionsService.countSumOfDonations(
      request.user.id,
      destId,
    );
  }

  @Get('owner/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if user is the owner' })
  isTheOwner(
    @Request() request: IRequestWithUser,
    @Param('productId') productId: string,
  ) {
    return this.transactionsService.isUserTheOwner(request.user.id, productId);
  }
}
