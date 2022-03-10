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
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        await this.isEmailUnique(createUserDto.email);
        await this.isUsernameUnique(createUserDto.username);
        let userWithEmptyReleases = {
            ...createUserDto,
            releases: []
        }
        let user = await this.userModel.create(userWithEmptyReleases);
        return this.buildRegistrationInfo(user);
    }

    async find(username: string): Promise<IUserResponse[] | IUserResponse> {
        if(username) return await this.findUserByUsername(username);
        return await this.findAll();
    }

    async findAll(): Promise<IUserResponse[]> {
        const users = await this.userModel.find();
        return users.map((user) => (this.buildUserInfo(user)));
    }

    async remove(userId: string): Promise<IRemoveResponse> {
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

    async findUserByUsername(username: string): Promise<IUserResponse | undefined> {
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new BadRequestException("This user doesn't exist");
        }
        return this.buildUserInfo(user);
    }

    async findUserByEmail(email: string): Promise<UserDocument | undefined> {
        const user = await this.userModel.findOne({ email });
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
}
