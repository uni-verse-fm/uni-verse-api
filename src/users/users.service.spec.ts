import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as data from '../test-utils/data/mock_data.json';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';
import RepoMockModel from '../test-utils/mocks/standard-mock.service';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('60s'),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users),
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await userService.findAll();
      const expected = Object.entries(data.users).map((user) => ({
        id: user[1]._id,
        username: user[1].username,
        email: user[1].email,
      }));
      expect(result).toStrictEqual(expected);
    });
  });

  describe('find user by email', () => {
    const mockUser = data.users.abdou;
    const expected = {
      _id: mockUser._id,
      username: mockUser.username,
      email: mockUser.email,
      password: mockUser.password,
    };

    it('should return a user', async () => {
      const result = await userService.findUserByEmail(mockUser.email);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('find user by username', () => {
    const mockUser = data.users.abdou;
    const expected = {
      _id: mockUser._id,
      username: mockUser.username,
      email: mockUser.email,
      password: mockUser.password,
    };

    it('should return a user', async () => {
      const result = await userService.findUserByUsername(mockUser.username);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('remove', () => {
    const mockUser = data.users.abdou;
    const mockEmail = mockUser.email;
    const userId = '0';

    it('should return a user', async () => {
      const result = await userService.remove(userId);
      expect(result).toStrictEqual({ email: mockEmail, msg: 'user deleted' });
    });
  });

  describe('create', () => {
    const user = {
      username: data.users.yoni.username,
      email: data.users.yoni.email,
      password: data.users.yoni.password,
    };
    const expected = {
      username: data.users.yoni.username,
      email: data.users.yoni.email,
    };
    it('should return a user without password', async () => {
      const result = await userService.create(user);
      expect(result).toStrictEqual(expected);
    });
  });
});
