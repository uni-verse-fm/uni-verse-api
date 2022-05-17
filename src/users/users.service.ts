import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IRemoveResponse } from './interfaces/remove-response.interface';
import { IUserResponse } from './interfaces/user-response.interface';
import { User, UserDocument } from './schemas/user.schema';
import { PaymentsService } from '../payments/payments.service';
import { isValidId } from '../utils/is-valid-id';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private stripeService: PaymentsService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    this.logger.log('creating user');
    await this.isEmailUnique(createUserDto.email);
    await this.isUsernameUnique(createUserDto.username);
    const stripeCustomer = await this.stripeService.createCustomer(
      createUserDto.username,
      createUserDto.email,
    );
    const userWithEmptyReleases = {
      ...createUserDto,
      releases: [],
      stripeCustomerId: stripeCustomer.id,
    };
    const user = await this.userModel.create(userWithEmptyReleases);
    return this.buildRegistrationInfo(user);
  }

  async findUsers(username: string): Promise<IUserResponse[] | IUserResponse> {
    this.logger.log('finding users');
    if (username)
      return this.buildUserInfo(await this.findUserByUsername(username));
    return await this.findAllUsers();
  }

  async findAllUsers(): Promise<IUserResponse[]> {
    this.logger.log('finding all users');
    const users = await this.userModel.find();
    return users.map((user) => this.buildUserInfo(user));
  }

  async removeUser(userId: string): Promise<IRemoveResponse> {
    this.logger.log(`removing user ${userId}`);
    isValidId(userId);
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.error(`user ${userId} not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    await user.remove();
    return {
      email: user.email,
      msg: 'user deleted',
    };
  }

  async findUserByUsername(username: string): Promise<UserDocument> {
    this.logger.log(`finding user ${username}`);
    const user = await this.userModel.findOne({ username: username });
    if (!user) {
      this.logger.error(`user ${username} not found`);
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  async findManyUsersByUsernames(usernames: string[]): Promise<UserDocument[]> {
    this.logger.log(`finding users ${usernames}`);
    return await Promise.all(
      usernames.map((username) => this.findUserByUsername(username)),
    );
  }

  async findUserByEmail(email: string): Promise<UserDocument | undefined> {
    this.logger.log(`finding user ${email}`);
    const user = await this.userModel
      .findOne({ email: email })
      .select('+password');
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  async findUserById(userId: string): Promise<IUserResponse | undefined> {
    this.logger.log(`finding user ${userId}`);
    isValidId(userId);
    const user = await this.findById(userId);
    return this.buildUserInfo(user);
  }

  async findById(userId: string): Promise<User | undefined> {
    this.logger.log(`finding user ${userId}`);
    isValidId(userId);
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.error(`user ${userId} not found`);
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  private buildUserInfo(user: User): IUserResponse {
    this.logger.log(`building user info ${user.username}`);
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
  }

  private async isUsernameUnique(username: string) {
    this.logger.log(`checking if username ${username} is unique`);
    const user = await this.userModel.findOne({ username: username });
    if (user?.username === username) {
      this.logger.error(`username ${username} is not unique`);
      throw new BadRequestException('Username must be unique.');
    }
  }

  private async isEmailUnique(email: string) {
    this.logger.log(`checking if email ${email} is unique`);
    const user = await this.userModel.findOne({ email: email });
    if (user?.email === email) {
      this.logger.error(`email ${email} is not unique`);
      throw new BadRequestException('Email must be unique.');
    }
  }

  private buildRegistrationInfo(user): any {
    this.logger.log(`building registration info ${user.username}`);
    const userRegistrationInfo = {
      username: user.username,
      email: user.email,
    };
    return userRegistrationInfo;
  }
}
