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
import { IUpdateResponse } from './interfaces/update-response.interface';
import { IRequestWithUser } from './interfaces/request-with-user.interface';
import * as bcrypt from 'bcrypt';

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
    const userWithEmptyReleases = {
      ...createUserDto,
      releases: [],
      stripeAccountId: null,
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
    await user.remove();
    this.usersSearchService.deleteIndex(id);
    return {
      email: user.email,
      msg: 'user deleted',
    };
  }

  async onboardUser(request: IRequestWithUser) {
    const id = request.user?._id;
    const userAccountId = request.user?.stripeAccountId;
    this.logger.log(`Onboarding user ${id}`);

    const accountId =
      userAccountId || (await this.stripeService.createAccount());
    const donationProductId = await this.stripeService.createDonations(id);
    await this.updateUserStripeAccountId(id, accountId);
    await this.updateUserDonationProductId(id, donationProductId);

    const user = await this.findById(id);
    return this.stripeService.onboard(user);
  }

  async updateUserStripeAccountId(
    id: string,
    accountId: string,
  ): Promise<IUpdateResponse> {
    this.logger.log(`Updating account id for user ${id}`);
    isValidId(id);
    const user = await this.findById(id);
    return await this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: { stripeAccountId: accountId },
        },
      )
      .then(() => ({
        id,
        msg: 'user account id updated',
      }))
      .catch(() => {
        this.logger.error(`Couldn't update your account id for user ${id}`);
        throw new Error("Couldn't update your account id");
      });
  }

  async updateUserDonationProductId(
    id: string,
    donationProductId: string,
  ): Promise<IUpdateResponse> {
    this.logger.log(`Updating donation product id for user ${id}`);
    isValidId(id);
    const user = await this.findById(id);
    return await this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: { donationProductId: donationProductId },
        },
      )
      .then(() => ({
        id,
        msg: 'user account id updated',
      }))
      .catch(() => {
        this.logger.error(`Couldn't update donation product id for user ${id}`);
        throw new Error("Couldn't update donation product id ");
      });
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

  async findManyUsersByIds(ids: string[]): Promise<UserDocument[]> {
    this.logger.log(`Finding users by ids`);
    const users = await this.userModel.find({
      _id: {
        $in: ids,
      },
    });

    if (ids.length !== users.length) {
      this.logger.error("one or more users who doesn't exist on our database");

      throw new BadRequestException(
        "one or more users who doesn't exist on our database",
      );
    }
    return users;
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

  async searchUser(search: string, meId: string) {
    this.logger.log(`Searching user ${meId}`);
    const results = await this.usersSearchService.searchIndex(search);
    const ids = results.map((result) => result.id).filter((id) => id !== meId);
    if (!ids.length) {
      return [];
    }
    return this.userModel.find({
      _id: {
        $in: ids,
      },
    });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    this.logger.log(`Setting refresh token ${userId}`);

    this.logger.debug(`refreshToken ${refreshToken}`);

    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: { currentHashedRefreshToken },
      },
    );
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    this.logger.log(`Getting refresh token ${userId}`);
    const user = await this.userModel
      .findOne({ _id: userId })
      .select('+currentHashedRefreshToken');

    this.logger.debug(`refreshToken: ${refreshToken}`);
    this.logger.debug(
      `user.currentHashedRefreshToken: ${user.currentHashedRefreshToken}`,
    );

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    this.logger.debug(`isRefreshTokenMatching: ${isRefreshTokenMatching}`);

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: string) {
    return this.userModel.updateOne(
      { _id: userId },
      {
        $set: { currentHashedRefreshToken: null },
      },
    );
  }
}
