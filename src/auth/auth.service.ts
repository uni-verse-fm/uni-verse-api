import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  public getCookieWithJwtToken(userId: string): string {
    this.logger.log(`Generating JWT token for user ${userId}`);
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME')}`,
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
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
    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    }
    return user;
  }

  public getCookieForLogOut() {
    this.logger.log(`Generating empty JWT for logout`);
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  async checkPassword(password: string, user: User): Promise<boolean> {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Wrong email or password.');
    }
    return match;
  }
}
