import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FeatRequestsService } from './feat-requests.service';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';

@ApiTags('feat-requests')
@Controller('feat-requests')
export class FeatRequestsController {
  constructor(private readonly featRequestsService: FeatRequestsService) {}

  @Get('sent')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find sent feat requests' })
  findSentRequestId(@Request() request: IRequestWithUser) {
    return this.featRequestsService.findUserSentFeatRequests(request.user.id);
  }

  @Get('received')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find received feat request' })
  findRecievedRequestId(@Request() request: IRequestWithUser) {
    return this.featRequestsService.findUserReceivedFeatRequest(
      request.user.id,
    );
  }

  @Patch('accept/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Accept feat request' })
  acceptRequest(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.featRequestsService.acceptFeatRequest(request.user.id, id);
  }

  @Patch('refuse/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Refuse feat request' })
  refuseRequest(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.featRequestsService.refuseFeatRequest(request.user.id, id);
  }
}
