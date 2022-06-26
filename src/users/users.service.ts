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
import { CreateUserWithGoogleDto } from './dto/create-google-user.dto';
import { Provider } from '../auth/auth.service';
import * as mongoose from 'mongoose';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { FilesService } from '../files/files.service';
import { BucketName } from '../minio-client/minio-client.service';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private stripeService: PaymentsService,
    private filesService: FilesService,
    private usersSearchService: UsersSearchService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    this.logger.log('Creating user');
    await this.isEmailUnique(createUserDto.email);
    await this.isUsernameUnique(createUserDto.username);
    const userWithEmptyReleases = {
      ...createUserDto,
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
      throw new NotFoundException("This user doesn't exist");
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
      profilePicture: user.profilePicture,
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
    const ids = results
      .filter((user) => user.id !== meId && user.username !== 'admin')
      .map((result) => new mongoose.Types.ObjectId(result.id));
    if (!ids.length) {
      return [];
    }
    return this.userModel
      .find({
        _id: {
          $in: ids,
        },
      })
      .catch(() => {
        this.logger.error(`Couldn't search user ${search}`);
        throw new Error("Couldn't search user");
      });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    this.logger.log(`Setting refresh token ${userId}`);
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

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

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

  async createUserWithProvider(
    { email, username }: CreateUserWithGoogleDto,
    provider: Provider,
  ) {
    this.logger.log('Creating google user');
    await this.isEmailUnique(email);
    await this.isUsernameUnique(username);
    const googleUserWithEmptyReleases = {
      email,
      username,
      releases: [],
      provider,
      stripeAccountId: null,
    };

    const userToSave = new this.userModel(googleUserWithEmptyReleases);

    const user = await userToSave.save();
    this.usersSearchService.insertIndex(user);

    return user;
  }

  async changePassword(password: string, user: User) {
    this.logger.log(`Changing password ${user.username}`);

    const hashed = await bcrypt.hash(password, 10);

    return await this.userModel
      .updateOne(user, { password: hashed })
      .then(() => ({
        id: user._id.toString(),
        message: 'Password changed',
      }))
      .catch(() => {
        throw new Error("Can't change password");
      });
  }

  async changeImage(file: SimpleCreateFileDto, user: User) {
    this.logger.log(`Changing image ${user.username}`);
    return await this.filesService
      .createFile(file, BucketName.Images)
      .then(
        async (fileName) =>
          await this.userModel
            .updateOne(user, { profilePicture: fileName })
            .then(() => ({
              id: user._id.toString(),
              message: 'Profile picture changed',
            }))
            .catch(() => {
              throw new Error("Can't change profile picture");
            }),
      )
      .then(async () => {
        user.profilePicture &&
          (await this.filesService
            .removeFile(user.profilePicture, BucketName.Images)
            .then());
      })
      .catch(() => {
        this.logger.error(
          `Couldn't change Profile picture ${file.originalFileName}`,
        );
        throw new Error("Couldn't change Profile picture");
      });
  }

  async missingIndexManager(user: User) {
    this.logger.log(`Missing index manager ${user.email}`);
    const response = await this.usersSearchService.existIndex(user.email);
    if (!response) {
      await this.usersSearchService.insertIndex(user).catch(() => {
        this.logger.error(`Couldn't create index for ${user.email}`);
        throw new Error("Couldn't create index");
      });
    }
  }
}
