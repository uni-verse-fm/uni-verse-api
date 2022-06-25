import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  Post,
  Res,
  Body,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
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
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @Get('/search')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Search user' })
  searchUsers(
    @Query('search') search: string,
    @Request() request: IRequestWithUser,
  ) {
    if (search) return this.usersService.searchUser(search, request.user.id);
    return [];
  }

  @Post('/onboard')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Onboad to stripe' })
  async onboardUser(
    @Request() request: IRequestWithUser,
    @Res() response: ExpressResponse,
  ) {
    const onboardUrl = await this.usersService.onboardUser(request);
    return response.json({ onboardUrl });
  }

  @Post('/password')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Body() changePassword: ChangePasswordDto,
    @Request() request: IRequestWithUser,
  ) {
    return await this.usersService.changePassword(
      changePassword.password,
      request.user,
    );
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
