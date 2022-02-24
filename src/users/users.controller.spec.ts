import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { userRepoMockModel } from '../test-utils/mocks/users-mock.service';
import { mockCreateResponse, mockCreateUser, mockUsers } from '../test-utils/data/data-test';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import mockedJwtService from '../test-utils/mocks/jwt-mock.service';
import { AuthService } from '../auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
    let app: INestApplication;
    const loginUser = {
        email: mockUsers[0].email,
        password: mockUsers[0].password
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                UsersService,
                AuthService,
                {
                    provide: JwtService,
                    useValue: mockedJwtService
                },
                {
                    provide: getModelToken(User.name),
                    useValue: userRepoMockModel
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    return true
                },
            })
            .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    describe('register', () => {
        it('should return a user without password', () => {
            const expectedResult =
            {
                username: mockCreateUser.username,
                email: mockCreateUser.email,
            };

            return request(app.getHttpServer())
                .post('/users/register')
                .send(mockCreateUser)
                .expect(201)
                .expect(mockCreateResponse)
        });
    })

    describe('login', () => {
        it('should return a user with jwt', () => {
            const bcryptCompare = jest.fn().mockResolvedValue(true);
            (bcrypt.compare as jest.Mock) = bcryptCompare;

            const result = {
                email: mockUsers[0].email,
                username: mockUsers[0].username,
                jwt: "mercure23beta"
            };

            return request(app.getHttpServer())
                .post('/users/login')
                .send(loginUser)
                .expect(201)
                .expect(result)


        });
    })

    describe('findAll', () => {
        it('should return all users', async () => {

            return request(app.getHttpServer())
                .get('/users')
                .expect(200)
                .expect(mockUsers.map(mockUser => (
                    {
                        username: mockUser.username,
                        email: mockUser.email
                    }
                )));
        });
    })

    describe('findUserByEmail', () => {

        const encodedMail = encodeURIComponent(mockUsers[0].email)

        it('should return a user', async () => {
            return request(app.getHttpServer())
                .get(`/users/user?email=${encodedMail}`)
                .expect(200)
                .expect({
                    email: mockUsers[0].email,
                    username: mockUsers[0].username
                }
                );
        });
    })

    describe('findUserByUsername', () => {
        it('should return a user', async () => {
            return request(app.getHttpServer())
                .get(`/users/${mockUsers[0].username}`)
                .expect(200)
                .expect({
                    email: mockUsers[0].email,
                    username: mockUsers[0].username
                }
                );
        });
    })
});
