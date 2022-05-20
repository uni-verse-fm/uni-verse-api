import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as data from '../test-utils/data/mock_data.json';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';
import { PaymentServiceMock } from '../test-utils/mocks/payment.service.test';
import { data2list } from '../test-utils/mocks/standard-mock.service.test';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';

const create_users = data2list(data.create_users);
describe('UsersService', () => {
  let userService: UsersService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [
        UsersService,
        ConfigModule,
        PaymentServiceMock,
        UserSearchServiceMock,
      ],
    }).compile();
    userService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('create', () => {
    create_users.forEach((user) => {
      it(`should create a user with email ${user.email}`, async () => {
        const createdUser = await userService.createUser(user);
        expect(createdUser.email).toBe(user.email);
        expect(createdUser.username).toBe(user.username);
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await userService.findAllUsers();
      const expected = Object.entries(data.users)
        .map((user) => ({
          username: user[1].username,
          email: user[1].email,
        }))
        .sort((a, b) => a.username.localeCompare(b.username));

      const cleanedResult = result
        .map((user) => ({
          username: user.username,
          email: user.email,
        }))
        .sort((a, b) => a.username.localeCompare(b.username));

      expect(cleanedResult).toStrictEqual(expected);
    });
  });

  describe('find user by email', () => {
    const mockUser = data.users.abdou;
    const expected = {
      username: mockUser.username,
      email: mockUser.email,
      password: mockUser.password,
    };

    it('should return a user', async () => {
      const result = await userService.findUserByEmail(mockUser.email);
      expect(result.username).toBe(expected.username);
      expect(result.email).toBe(expected.email);
    });
  });

  describe('find user by username', () => {
    const mockUser = data.users.abdou;
    const expected = {
      username: mockUser.username,
      email: mockUser.email,
      password: mockUser.password,
    };

    it('should return a user', async () => {
      const result = await userService.findUserByUsername(mockUser.username);
      expect(result.username).toBe(expected.username);
      expect(result.email).toBe(expected.email);
    });
  });

  describe('remove', () => {
    const mockUser = data.users.abdou;
    const mockEmail = mockUser.email;

    it('should return a user', async () => {
      const abdou = await userService.findUserByUsername(mockUser.username);
      const result = await userService.removeUser(abdou._id.toString());
      expect(result).toStrictEqual({ email: mockEmail, msg: 'user deleted' });
    });
  });
});
