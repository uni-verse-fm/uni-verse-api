import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { mockCreateResponse, mockCreateUser, mockUsers } from '../test-utils/data/data-test';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';
import { UserRepoMockModel } from '../test-utils/mocks/users-mock.service';
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
                    }
                },
                {
                    provide: getModelToken(User.name),
                    useValue: UserRepoMockModel,
                },
            ],
        }).compile();

        userService = module.get<UsersService>(UsersService);
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
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

    describe('find user by email', () => {
        let mockUser = mockUsers[0];
        let expected = {
            _id: mockUser._id,
            username: mockUser.username,
            email: mockUser.email,
            password: mockUser.password
        };

        it('should return a user', async () => {
            const result = await userService.findUserByEmail(mockUser.email);
            expect(result).toStrictEqual(expected);
        });
    });

    describe('find user by username', () => {
        let mockUser = mockUsers[0];
        let expected = {
            id: mockUser._id,
            username: mockUser.username,
            email: mockUser.email,
        };

        it('should return a user', async () => {
            const result = await userService.findUserByUsername(mockUser.username);
            expect(result).toStrictEqual(expected);
        });
    });

    describe('remove', () => {
        let mockUser = mockUsers[0];
        let mockEmail = mockUser.email;
        let userId = '0';

        it('should return a user', async () => {
            const result = await userService.remove(userId);
            expect(result).toStrictEqual({ email: mockEmail, msg: 'user deleted' });
        });
    });

    describe('create', () => {
        const expected = {
            username: mockUsers[0].username,
            email: mockUsers[0].email,
            jwt: 'mercure23beta',
        };
        it('should return a user without password', async () => {
            const result = await userService.create(mockCreateUser);
            expect(result).toStrictEqual(mockCreateResponse);
        });
    });
});
