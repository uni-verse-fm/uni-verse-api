import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import * as request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { AuthController } from '../auth/auth.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as data from '../test-utils/data/mock_data.json';
import { FilesService } from '../files/files.service';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';
import { ConfigServiceMock } from '../test-utils/mocks/config.service.test';
import { PaymentServiceMock } from '../test-utils/mocks/payment.service.test';
import { UsersServiceMock } from '../test-utils/mocks/users.service.test';

const user = data.users.kanye;

describe('UsersController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '6000s' },
          }),
        }),
      ],
      controllers: [UsersController, AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        FilesService,
        LocalStrategy,
        ConfigServiceMock,
        MinioServiceMock,
        PaymentServiceMock,
        UsersServiceMock,
        UserSearchServiceMock,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = data.users.jayz;
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('find all users', () => {
    const expected = Object.entries(data.users).map((user) => ({
      id: user[1]._id,
      username: user[1].username,
      email: user[1].email,
    }));
    it('should return all users', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect(expected);
    });
  });

  describe('find user by username', () => {
    const username = encodeURI(user.username);
    it('should return a user', async () => {
      return request(app.getHttpServer())
        .get(`/users?username=${username}`)
        .expect(200)
        .expect({
          id: user._id,
          email: user.email,
          username: user.username,
        });
    });
  });
  describe('delete my user', () => {
    const expected = {
      email: user.email,
      msg: 'user deleted',
    };

    it('should return an email with a message', async () => {
      return await request(app.getHttpServer())
        .delete('/users')
        .expect(expected);
    });
  });

  afterAll((done) => {
    app.close();
    done();
  });
});
