import {
    ExecutionContext,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseRepoMockModel, UserRepoMockModel } from '../test-utils/mocks/users-mock.service';
import {
    mockReleases,
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
import { ReleasesService } from '../releases/releases.service';
import { Release } from '../releases/schemas/release.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
                        signOptions: { expiresIn: '6000s' }
                    })
                }),
            ],
            controllers: [UsersController, AuthController],
            providers: [
                UsersService,
                AuthService,
                JwtStrategy,
                ReleasesService,
                LocalStrategy,
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
                {
                    provide: getModelToken(Release.name),
                    useValue: ReleaseRepoMockModel,
                },
            ],
        }).overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: "0" };
                    return true
                },
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
                .get(`/users?username=${mockUsers[0].username}`)
                .expect(200)
                .expect({
                    id: mockUsers[0]._id,
                    email: mockUsers[0].email,
                    username: mockUsers[0].username,
                });
        });
    });
    describe('delete my user', () => {

        const expected = {
            email: mockUsers[0].email,
            msg: 'user deleted',
        };


        it('should return an email with a message', async () => {
            return await request(app.getHttpServer())
                .delete('/users')
                .expect(expected);
        });
    });

    describe('create a release', () => {

        const body = {
            title: mockReleases[0].title,
            description: mockReleases[0].description,
            coverUrl: mockReleases[0].coverUrl,
        };

        const expected = {
            title: mockReleases[0].title,
            description: mockReleases[0].description,
            coverUrl: mockReleases[0].coverUrl,
            author: {
                id: mockReleases[0].author._id,
                username: mockReleases[0].author.username,
                email: mockReleases[0].author.email
            }
        };

        it('should return a release', async () => {

            return await request(app.getHttpServer())
                .post('/users/me/release')
                .send(body)
                .expect(expected);
        });
    });

    describe('delete my release', () => {

        const expected = {
            id: mockReleases[0]._id,
            title: mockReleases[0].title,
            msg: 'Release deleted',
        };

        it('should return the release', async () => {
            return await request(app.getHttpServer())
                .delete(`/users/me/release/${mockReleases[0]._id}`)
                .expect(expected);
        });
    });


    afterAll(done => {
        app.close();
        done();
    })
});
