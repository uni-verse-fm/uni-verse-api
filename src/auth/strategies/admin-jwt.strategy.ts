/* Copyright (c) 2022 uni-verse corp */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { User } from '../../users/schemas/user.schema';
import { AES, enc } from 'crypto-js';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  private readonly logger = new Logger(AdminJwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.headers?.authorization
            ? AES.decrypt(
                request?.headers?.authorization as string,
                configService.get('UNIVERSE_PRIVATE_KEY'),
              ).toString(enc.Utf8)
            : undefined;
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(
    payload: TokenPayload,
  ): Promise<User & { accessToken: string }> {
    this.logger.log(`Validating admin ${payload.userId}`);
    return await this.authService.getAuthenticatedAdminById(payload.userId);
  }
}
