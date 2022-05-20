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
import UsersSearchService from './users-search.service';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private stripeService: PaymentsService,
    private usersSearchService: UsersSearchService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    this.logger.log('Creating user');
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

    const userToSave = new this.userModel(userWithEmptyReleases);

    const user = await userToSave.save();
    this.usersSearchService.insertIndex(user);

    return this.buildRegistrationInfo(user);
  }

  async findUsers(username: string): Promise<IUserResponse[] | IUserResponse> {
    this.logger.log('Finding users');
    if (username)
      return this.buildUserInfo(await this.findUserByUsername(username));
    return await this.findAllUsers();
  }

  async findAllUsers(): Promise<IUserResponse[]> {
    this.logger.log('Finding all users');
    const users = await this.userModel.find();
    return users.map((user) => this.buildUserInfo(user));
  }

  async removeUser(id: string): Promise<IRemoveResponse> {
    this.logger.log(`Removing user ${id}`);
    isValidId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      this.logger.error(`User ${id} not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.usersSearchService.deleteIndex(id);
    await user.remove();
    return {
      email: user.email,
      msg: 'user deleted',
    };
  }

  async findUserByUsername(username: string): Promise<UserDocument> {
    this.logger.log(`Finding user ${username}`);
    const user = await this.userModel.findOne({ username: username });
    if (!user) {
      this.logger.error(`User ${username} not found`);
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  async findManyUsersByUsernames(usernames: string[]): Promise<UserDocument[]> {
    this.logger.log(`Finding users ${usernames}`);
    return await Promise.all(
      usernames.map((username) => this.findUserByUsername(username)),
    );
  }

  async findUserByEmail(email: string): Promise<UserDocument | undefined> {
    this.logger.log(`Finding user ${email}`);
    const user = await this.userModel
      .findOne({ email: email })
      .select('+password');
    if (!user) {
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  async findUserById(id: string): Promise<IUserResponse> {
    this.logger.log(`Finding user ${id}`);
    isValidId(id);
    const user = await this.findById(id);
    return this.buildUserInfo(user);
  }

  async findById(id: string): Promise<User> {
    this.logger.log(`Finding user ${id}`);
    isValidId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      this.logger.error(`User ${id} not found`);
      throw new BadRequestException("This user doesn't exist");
    }
    return user;
  }

  private buildUserInfo(user: User): IUserResponse {
    this.logger.log(`Building user info ${user.username}`);
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
  }

  private async isUsernameUnique(username: string) {
    this.logger.log(`Checking if username ${username} is unique`);
    const user = await this.userModel.findOne({ username: username });
    if (user?.username === username) {
      this.logger.error(`Username ${username} is not unique`);
      throw new BadRequestException('Username must be unique.');
    }
  }

  private async isEmailUnique(email: string) {
    this.logger.log(`Checking if email ${email} is unique`);
    const user = await this.userModel.findOne({ email: email });
    if (user?.email === email) {
      this.logger.error(`Email ${email} is not unique`);
      throw new BadRequestException('Email must be unique.');
    }
  }

  private buildRegistrationInfo(user): any {
    this.logger.log(`Building registration info ${user.username}`);
    const userRegistrationInfo = {
      username: user.username,
      email: user.email,
    };
    return userRegistrationInfo;
  }

  async searchUser(search: string) {
    const results = await this.usersSearchService.searchIndex(search);
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }
    return this.userModel.find({
      _id: {
        $in: ids,
      },
    });
  }
}
