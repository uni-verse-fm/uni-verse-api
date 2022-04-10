import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from './interfaces/request-with-user.interface';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({ name: 'username', required: false })
  @ApiOperation({ summary: 'Find all users or one user by username' })
  find(@Query('username') username = '') {
    return this.usersService.findUsers(username);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one user by id' })
  findOneById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiCookieAuth('Set-Cookie')
  remove(@Request() request: IRequestWithUser) {
    return this.usersService.removeUser(request.user.id);
  }
}
