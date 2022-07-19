import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  UseInterceptors,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Send a message' })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.messagesService.createMessage(
      createMessageDto,
      request.user.id,
    );
  }

  @Get('contacts')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Get my contacts' })
  userFriends(@Request() request: IRequestWithUser) {
    return this.messagesService.findUserContacts(request.user._id.toString());
  }

  @Get('user/:friendId')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Get messages between me and a contact' })
  findFriendMessages(
    @Param('friendId') friendId: string,
    @Request() request: IRequestWithUser,
  ) {
    return this.messagesService.findContactMessages(
      request.user._id.toString(),
      friendId,
    );
  }
}
