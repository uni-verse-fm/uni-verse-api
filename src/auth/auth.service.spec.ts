import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as data from '../test-utils/data/mock_data.json'

const user = data.users.abdou

describe('AuthService', () => {
    let service: AuthService;
    let get: jest.Mock;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
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
                    provide: UsersService,
                    useValue: {
                        findUserByEmail: jest.fn().mockReturnValue(user)
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('when ask for a cookie', () => {
        it('should return a string', () => {
            get
            let userId = '0';
            let expectedResult = 'Authentication=mercure23beta; HttpOnly; Path=/; Max-Age=60s';
            let jwt = service.getCookieWithJwtToken(userId);
            expect(jwt).toBe(expectedResult);
        });
    });

    describe('when logout', () => {
        it('should return an empty', () => {
            let expectedResult = "Authentication=; HttpOnly; Path=/; Max-Age=0";
            let jwt = service.getCookieForLogOut();
            expect(jwt).toBe(expectedResult);
        });
    });

    describe('when ask for authenticated user', () => {
        it('should return a user', async () => {
            let userEmail = '96abdou96@gmail.com';
            let userPassword = 'Super123+';
            let user = await service.getAuthenticatedUser(userEmail, userPassword);
            expect(user).toStrictEqual({
                ...user,
                password: undefined
            });
        });
    });
});
