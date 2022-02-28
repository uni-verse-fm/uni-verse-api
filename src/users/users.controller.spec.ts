import {
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { userRepoMockModel } from '../test-utils/mocks/users-mock.service';
import {
    mockUsers,
} from '../test-utils/data/data-test';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as request from 'supertest';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { AuthController } from '../auth/auth.controller';

const loginUser = {
    email: mockUsers[0].email,
    password: 'Super123+',
};

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
                        signOptions: { expiresIn: '60s' }
                    })
                }),
            ],
            controllers: [UsersController, AuthController],
            providers: [
                UsersService,
                AuthService,
                JwtStrategy,
                LocalStrategy,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('60s'),
                    }
                },
                {
                    provide: getModelToken(User.name),
                    useValue: userRepoMockModel,
                },
            ],
        })
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    describe('find all users', () => {
        it('should return all users', async () => {
            return request(app.getHttpServer())
                .get('/users')
                .expect(200)
                .expect(
                    mockUsers.map((mockUser) => ({
                        id: mockUser._id,
                        username: mockUser.username,
                        email: mockUser.email,
                    })),
                );
        });
    });

    describe('find user by username', () => {
        it('should return a user', async () => {
            return request(app.getHttpServer())
                .get(`/users/${mockUsers[0].username}`)
                .expect(200)
                .expect({
                    id: mockUsers[0]._id,
                    email: mockUsers[0].email,
                    username: mockUsers[0].username,
                });
        });
    });

    describe('delete my user', () => {

        var cookie: string = ""

        const expected = {
            email: mockUsers[0].email,
            msg: 'user deleted',
        };

        it('should return an email with a message', async () => {

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginUser)
            
            const req = request(app.getHttpServer())
                .delete('/users')
                .set('cookie', response.get('set-cookie')[0])
                .expect(expected);
        });
    });

    afterAll(done => {
        app.close();
        done();
    })
});
