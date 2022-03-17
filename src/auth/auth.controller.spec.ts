import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import { LocalStrategy } from './strategies/local.strategy';
import * as data from '../test-utils/data/mock_data.json';
import { data2list } from '../test-utils/mocks/standard-mock.service';
import { LoginDto } from './dto/login.dto';

const users = data2list(data.users);
const user = data.users.abdou;
const user1 = data.users.yoni;

describe('AuthController', () => {
  let app: INestApplication;
  const loginUser: LoginDto = {
    email: user.email,
    password: 'Super123+',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
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
            findUserByEmail: (email: string) =>
              users.find((user) => user.email === email),
            create: () => ({
              username: user1.username,
              email: user1.email,
            }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(passport.initialize());
    await app.init();
  });

  describe('login', () => {
    it('should return 401 if username does not exist', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'unknown', password: 'anything' })
        .expect(401);
    });

    it('should return 401 if password is incorrect', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: 'anything' })
        .expect(401);
    });

    it('should return a user with jwt', () => {
      const result = {
        id: user._id,
        email: user.email,
        username: user.username,
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUser)
        .expect(201)
        .expect(result);
    });
  });

  describe('register', () => {
    const expected = {
      username: user1.username,
      email: user1.email,
    };

    it('should return a user without password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(user1)
        .expect(201)
        .expect(expected);
    });
  });

  afterAll((done) => {
    app.close();
    done();
  });
});
