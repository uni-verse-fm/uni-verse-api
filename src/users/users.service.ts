import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IRemoveResponse } from './interfaces/remove-response.interface';
import { IUserResponse } from './interfaces/user-response.interface';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    await this.isEmailUnique(createUserDto.email);
    await this.isUsernameUnique(createUserDto.username);
    const userWithEmptyReleases = {
      ...createUserDto,
      releases: [],
    };
    const user = await this.userModel.create(userWithEmptyReleases);
    return this.buildRegistrationInfo(user);
  }

  async findUsers(username: string): Promise<IUserResponse[] | IUserResponse> {
    if (username)
      return this.buildUserInfo(await this.findUserByUsername(username));
    return await this.findAllUsers();
  }

  async findAllUsers(): Promise<IUserResponse[]> {
    const users = await this.userModel.find();
    return users.map((user) => this.buildUserInfo(user));
  }

  async removeUser(userId: string): Promise<IRemoveResponse> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.userModel.deleteOne({ id: user._id });
    return {
      email: user.email,
      msg: 'user deleted',
    };
  }

  async findUserByUsername(username: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username: username });
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  async findManyUsersByUsernames(usernames: string[]): Promise<UserDocument[]> {
    return await Promise.all(
      usernames.map((username) => this.findUserByUsername(username)),
    );
  }

  async findUserByEmail(email: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findOne({ email: email }).select('+password');
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  async findUserById(userId: string): Promise<IUserResponse | undefined> {
    const user = await this.findById(userId);
    return this.buildUserInfo(user);
  }

  async findById(userId: string): Promise<User | undefined> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  private buildUserInfo(user: User): IUserResponse {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
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

  private buildRegistrationInfo(user): any {
    const userRegistrationInfo = {
      username: user.username,
      email: user.email,
    };
    return userRegistrationInfo;
  }
}
