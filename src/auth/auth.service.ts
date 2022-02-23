import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(userId: string) {
    const payload = { userId };
    return this.jwtService.sign(payload);
  }
}
