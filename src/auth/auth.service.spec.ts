import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service.test';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as data from '../test-utils/data/mock_data.json';

const user = data.users.abdou;

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
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn().mockReturnValue(user),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('when ask for a cookie', () => {
    it('should return a string', () => {
      get;
      const userId = '0';
      const expectedResult =
        'Authentication=mercure23beta; HttpOnly; Path=/; Max-Age=60s';
      const jwt = service.getCookieWithJwtToken(userId);
      expect(jwt).toBe(expectedResult);
    });
  });

  describe('when logout', () => {
    it('should return an empty', () => {
      const expectedResult = 'Authentication=; HttpOnly; Path=/; Max-Age=0';
      const jwt = service.getCookieForLogOut();
      expect(jwt).toBe(expectedResult);
    });
  });

  describe('when ask for authenticated user', () => {
    it('should return a user', async () => {
      const userEmail = '96abdou96@gmail.com';
      const userPassword = 'Super123+';
      const user = await service.getAuthenticatedUser(userEmail, userPassword);
      expect(user).toStrictEqual(user);
    });
  });
});
