import { UnauthorizedException } from '@nestjs/common';
/* Copyright (c) 2022 uni-verse corp */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class FpSearchInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers?.authorization;
    if (authorization !== this.configService.get('UNIVERSE_PRIVATE_KEY'))
      throw new UnauthorizedException('Wrong secret');
    return next.handle();
  }
}
