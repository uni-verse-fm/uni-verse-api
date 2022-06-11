import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as data from '../test-utils/data/mock_data.json';
import { ConfigServiceMock } from '../test-utils/mocks/config.service.test';
import { JwtServiceMock } from '../test-utils/mocks/jwt.service.test';

const user = data.users.abdou;

describe('AuthService', () => {
  let service: AuthService;
  let get: jest.Mock;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtServiceMock,
        ConfigServiceMock,
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

  describe('when ask for a cookie with refresh token', () => {
    it('should return a string', () => {
      get;
      const userId = '0';
      const expectedResult = {
        cookie: 'Authentication=mercure23beta; HttpOnly; Path=/; Max-Age=60s',
        token: 'mercure23beta',
      };
      const jwt = service.getCookieWithJwtAccessToken(userId);
      expect(jwt).toStrictEqual(expectedResult);
    });
  });

  describe('when ask for a cookie with refresh token', () => {
    it('should return a string', () => {
      get;
      const userId = '0';
      const expectedResult = {
        cookie: 'Refresh=mercure23beta; HttpOnly; Path=/; Max-Age=60s',
        token: 'mercure23beta',
      };
      const jwt = service.getCookieWithJwtRefreshToken(userId);
      expect(jwt).toStrictEqual(expectedResult);
    });
  });

  describe('when logout', () => {
    it('should return an empty', () => {
      const expectedResult = [
        'Authentication=; HttpOnly; Path=/; Max-Age=0',
        'Refresh=; HttpOnly; Path=/; Max-Age=0',
      ];
      const jwt = service.getCookiesForLogOut();
      expect(jwt).toStrictEqual(expectedResult);
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
