import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private authService: AuthService,
    @Inject('USER_MODEL')
    private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    await this.isEmailUnique(user.email);
    await this.isUsernameUnique(user.username);
    await user.save();
    return this.buildRegistrationInfo(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await await this.userModel.findOne({
      email: loginUserDto.email,
    });
    await this.checkPassword(loginUserDto.password, user);
    return {
      username: user.username,
      email: user.email,
      jwt: await this.authService.login(user._id),
    };
  }

  async findAll() {
    const users = await this.userModel.find();
    return {
      ...users,
    };
  }

  async remove(username: string) {
    const user = await this.findUserByUsername(username);
    await this.userModel.remove(user);
    return {
      email: user.email,
      msg: 'user deleted',
    };
  }

  private async checkPassword(password: string, user: User) {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new NotFoundException('Wrong email or password.');
    }
    return match;
  }

  private buildRegistrationInfo(user): any {
    const userRegistrationInfo = {
      username: user.username,
      email: user.email,
    };
    return userRegistrationInfo;
  }

  private async isUsernameUnique(username: string) {
    const user = await this.userModel.findOne({ username: username });
    if (user) {
      throw new BadRequestException('Username must be unique.');
    }
  }

  private async isEmailUnique(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      throw new BadRequestException('Email must be unique.');
    }
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return this.buildUserInfo(user);
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return this.buildUserInfo(user);
  }

  private buildUserInfo(user): any {
    const userUserInfo = {
      username: user.username,
      email: user.email,
    };
    return userUserInfo;
  }
}
