import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { CreateUserWithGoogleDto } from '../users/dto/create-google-user.dto';
import { Request as ExpressRequest } from 'express';
import { CreateUserWithSpotifyDto } from '../users/dto/create-spotify-user.dto';
import { ConfigService } from '@nestjs/config';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('google')
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: 'Register with google' })
  async authWithGoogle(
    @Body() createUserWithGoogle: CreateUserWithGoogleDto,
    @Req() request: ExpressRequest,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.authWithProvider(createUserWithGoogle, 'google');

    request.res.setHeader('Set-Cookie', [
      accessToken.cookie,
      refreshToken.cookie,
    ]);

    return user;
  }

  @Post('spotify')
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: 'Register with spotify' })
  async authWithSpotify(
    @Body() createUserWithSpotify: CreateUserWithSpotifyDto,
    @Req() request: ExpressRequest,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.authWithProvider(createUserWithSpotify, 'spotify');

    request.res.setHeader('Set-Cookie', [
      accessToken.cookie,
      refreshToken.cookie,
    ]);

    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  async login(@Request() request: IRequestWithUser, @Res() response: Response) {
    const { user } = request;

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
      user.username === 'admin'
        ? this.configService.get('ADMIN_TOKEN_EXPIRATION_TIME')
        : undefined,
    );
    const refreshTokenCookie = this.authService.getCookieWithJwtRefreshToken(
      user.id,
    );

    const simplifiedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      accountId: user.stripeAccountId,
      accessToken: accessTokenCookie.token,
      refreshToken: refreshTokenCookie.token,
    };

    await this.usersService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );

    if (user.username !== 'admin') {
      response.setHeader('Set-Cookie', [
        accessTokenCookie.cookie,
        refreshTokenCookie.cookie,
      ]);
      await this.usersService.missingIndexManager(user);
      response.setHeader('Authorization', accessTokenCookie.cookie);
    }

    return response.send(simplifiedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logOut(@Req() request: IRequestWithUser) {
    await this.usersService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Me' })
  me(@Request() request: IRequestWithUser, @Res() response: Response) {
    return response.send(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  @ApiOperation({ summary: 'Session' })
  session(@Request() request: IRequestWithUser, @Res() response: Response) {
    return response.send(request.user);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Req() request: IRequestWithUser) {
    const { user } = request;

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
      user.username === 'admin' ? '10s' : undefined,
    );

    request.res.setHeader('Set-Cookie', accessTokenCookie.cookie);
    request.res.setHeader('Authorization', accessTokenCookie.cookie);
    return {
      accessToken: accessTokenCookie.token,
    };
  }
}
