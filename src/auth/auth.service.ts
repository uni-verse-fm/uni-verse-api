/* Copyright (c) 2022 uni-verse corp */

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserWithGoogleDto } from '../users/dto/create-google-user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

export type Provider = 'local' | 'spotify' | 'google';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  public getCookieWithJwtAccessToken(userId: string, expires?: string) {
    this.logger.log(`Generating JWT access token for user ${userId}`);
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${
        expires || this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
      }`,
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${
      expires || this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')
    }`;
    return {
      cookie,
      token,
    };
  }

  public getCookieWithJwtRefreshToken(userId: string) {
    this.logger.log(`Generating JWT access token for user ${userId}`);
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
    return {
      cookie,
      token,
    };
  }

  public async getAuthenticatedUser(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    this.logger.log(`Local authenticating user ${email}`);
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }
    await this.checkPassword(password, user);
    return user;
  }

  public async getAuthenticatedUserById(id: string): Promise<User> {
    this.logger.log(`Get authenticated user ${id}`);
    const user = await this.usersService.findById(id);
    if (!user || user.username === 'admin') {
      throw new UnauthorizedException(
        "User either doesn't exist or trying to access as Admin",
      );
    }
    return user;
  }

  public async getAuthenticatedAdminById(
    id: string,
  ): Promise<User & { accessToken: string }> {
    this.logger.log(`Get authenticated admin ${id}`);
    const admin = await this.usersService.findById(id);
    if (!admin || admin.username !== 'admin') {
      throw new UnauthorizedException("Admin with this username doesn't exist");
    }
    return {
      ...admin,
      accessToken: this.getCookieWithJwtAccessToken(
        admin._id.toString(),
        this.configService.get('ADMIN_TOKEN_EXPIRATION_TIME'),
      ).token,
    };
  }

  public getCookiesForLogOut() {
    this.logger.log(`Generating empty JWT for logout`);
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    this.logger.log(`Checking password`);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Wrong email or password.');
    }
    return match;
  }

  async getCookiesForUser(user: User) {
    this.logger.log(`Getting cookies for ${user._id}`);
    const userId: string = user._id.toString();
    const accessToken = this.getCookieWithJwtAccessToken(userId);
    const refreshToken = this.getCookieWithJwtRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async handleRegisteredUser(user: User) {
    this.logger.log(`Handling registred user ${user._id}`);
    if (user.provider !== 'google' && user.provider !== 'spotify') {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } = await this.getCookiesForUser(user);

    await this.usersService.setCurrentRefreshToken(
      refreshToken.token,
      user._id.toString(),
    );
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async registerUser(
    createUserWithGoogle: CreateUserWithGoogleDto,
    provider: Provider,
  ) {
    this.logger.log(
      `Registring ${provider} user ${createUserWithGoogle.email}`,
    );
    const user = await this.usersService.createUserWithProvider(
      createUserWithGoogle,
      provider,
    );

    return this.handleRegisteredUser(user);
  }

  async authWithProvider(
    createUserWithGoogle: CreateUserWithGoogleDto,
    provider: Provider,
  ) {
    this.logger.log(
      `Authenticating ${provider} user ${createUserWithGoogle.email}`,
    );

    return await this.usersService
      .findUserByEmail(createUserWithGoogle.email)
      .then(async (user) => await this.handleRegisteredUser(user))
      .catch(async (error) => {
        this.logger.error(`Error can't autheticate`);
        if (error.response.statusCode !== 404) {
          throw new Error(error);
        }

        return await this.registerUser(createUserWithGoogle, provider).catch(
          (error) => {
            this.logger.error(`Error can't autheticate`);
            throw new Error(error);
          },
        );
      });
  }

  public buildLoginResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      stripeAccountId: user.stripeAccountId,
      accessToken,
      refreshToken,
    };
  }
}
