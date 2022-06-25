import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import UsersModule from '../users/users.module';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule, UsersModule, JwtModule.register({})],
  providers: [
    AuthService,
    AdminJwtStrategy,
    JwtStrategy,
    LocalStrategy,
    JwtRefreshTokenStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
