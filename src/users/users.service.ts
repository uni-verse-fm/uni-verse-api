import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { IUser } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { IUserResponse } from './interfaces/user-response.interface';
import { IRemoveResponse } from './interfaces/remove-response.interface';
import { ILoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class UsersService {
  constructor(
    private authService: AuthService,
    @InjectModel(User.name)
    private userModel: Model<IUser>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    await this.isEmailUnique(createUserDto.email);
    await this.isUsernameUnique(createUserDto.username);
    let user = await this.userModel.create(createUserDto);
    return this.buildRegistrationInfo(user);
  }

  async login(loginUserDto: LoginUserDto): Promise<ILoginResponse> {
    const user = await this.userModel.findOne({ email: loginUserDto.email });
    if (!user) {
      throw new NotFoundException("User doesn't exist");
    }
    await this.checkPassword(loginUserDto.password, user);
    const jwt = await this.authService.login(user._id);
    return {
      username: user.username,
      email: user.email,
      jwt,
    };
  }

  async findAll(): Promise<IUserResponse[]> {
    const users = await this.userModel.find();
    return users.map((user) => ({
      id: user._id,
      username: user.username,
      email: user.email,
    }));
  }

  async remove(userId: string): Promise<IRemoveResponse> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.userModel.deleteOne({ id: user.id });
    return {
      email: user.email,
      msg: 'user deleted',
    };
  }

  private async checkPassword(password: string, user: IUser): Promise<boolean> {
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
    if (user?.username === username) {
      throw new BadRequestException('Username must be unique.');
    }
  }

  private async isEmailUnique(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (user?.email === email) {
      throw new BadRequestException('Email must be unique.');
    }
  }

  async findUserByUsername(username: string): Promise<IUser | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return this.buildUserInfo(user);
  }

  async findUserByEmail(email: string): Promise<IUser | undefined> {
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
