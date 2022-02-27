import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private usersService: UsersService
    ) { }

    public getCookieWithJwtToken(userId: string): string {
        const payload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME')}`
        });
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
    }

    public async getAuthenticatedUser(email: string, password: string): Promise<IUser> {
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException("User doesn't exist");
        }
        await this.checkPassword(password, user);
        return user;
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }


    async checkPassword(password: string, user: IUser): Promise<boolean> {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new UnauthorizedException('Wrong email or password.');
        }
        return match;
    }
}
