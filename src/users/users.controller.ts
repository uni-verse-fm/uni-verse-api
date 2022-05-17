import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
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
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiQuery({ name: 'username', required: false })
  @ApiOperation({ summary: 'Find all users or one user by username' })
  find(@Query('username') username = '') {
    return this.usersService.findUsers(username);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one user by id' })
  @UseInterceptors(ValidIdInterceptor)
  findOneById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiCookieAuth('Set-Cookie')
  remove(@Request() request: IRequestWithUser) {
    return this.usersService.removeUser(request.user.id);
  }
}
