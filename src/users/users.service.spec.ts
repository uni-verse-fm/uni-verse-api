import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCreateResponse,
  mockCreateUser,
  mockUsers,
} from '../test-utils/data/data-test';
import { userRepoMockModel } from '../test-utils/mocks/users-mock.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';

describe('UsersService', () => {
  let userService: UsersService;
  let login: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(() => 'mercure23beta'),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: userRepoMockModel,
        },
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      userRepoMockModel.find;
      const result = await userService.findAll();
      expect(result).toStrictEqual(
        mockUsers.map((mockUser) => ({
          id: mockUser._id,
          username: mockUser.username,
          email: mockUser.email,
        })),
      );
    });
  });

  describe('findUserByEmail', () => {
    let mockUser = mockUsers[0];
    let expected = {
      username: mockUser.username,
      email: mockUser.email,
    };

    it('should return a user', async () => {
      userRepoMockModel.findOne;
      const result = await userService.findUserByEmail(mockUser.email);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('findUserByUsername', () => {
    let mockUser = mockUsers[0];
    let expected = {
      username: mockUser.username,
      email: mockUser.email,
    };

    it('should return a user', async () => {
      userRepoMockModel.findOne;
      const result = await userService.findUserByEmail(mockUser.username);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('remove', () => {
    let mockUser = mockUsers[0];
    let mockEmail = mockUser.email;
    let userId = '0';

    it('should return a user', async () => {
      userRepoMockModel.findById;
      const result = await userService.remove(userId);
      expect(result).toStrictEqual({ email: mockEmail, msg: 'user deleted' });
    });
  });

  describe('login', () => {
    const loginUser = {
      email: mockUsers[0].email,
      password: mockUsers[0].password,
    };
    const expected = {
      username: mockUsers[0].username,
      email: mockUsers[0].email,
      jwt: 'mercure23beta',
    };
    it('should return an array of users', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      userRepoMockModel.findOne;
      login;
      const result = await userService.login(loginUser);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('register', () => {
    const expected = {
      username: mockUsers[0].username,
      email: mockUsers[0].email,
      jwt: 'mercure23beta',
    };
    it('should return an array of users', async () => {
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      userRepoMockModel.findOne;
      userRepoMockModel.create;
      const result = await userService.create(mockCreateUser);
      expect(result).toStrictEqual(mockCreateResponse);
    });
  });
});
