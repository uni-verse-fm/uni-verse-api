import { Test, TestingModule } from '@nestjs/testing';
import { mockCreateResponse, mockCreateUser, mockUsers } from '../test-utils/data/data-test';
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

describe('AuthController', () => {
    let app: INestApplication;
    const loginUser = {
        email: mockUsers[0].email,
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
                    }
                },
                {
                    provide: UsersService,
                    useValue: {
                        findUserByEmail: (email: string) => mockUsers.find(user => user.email === email),
                        create: () => mockCreateResponse
                    },
                },
            ],
        })
        .compile();

        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        app.use(passport.initialize())
        await app.init();
    });

    describe('login', () => {

        it('should return 401 if username does not exist', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({email: 'unknown', password: 'anything'})
                .expect(401)
        })

        it('should return 401 if password is incorrect', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({email: mockUsers[0].email, password: 'anything'})
                .expect(401)
        })

        it('should return a user with jwt', () => {

            const result = {
                _id: mockUsers[0]._id,
                email: mockUsers[0].email,
                username: mockUsers[0].username
            };

            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginUser)
                .expect(201)
                .expect(result)            
        });
    });

    describe('register', () => {
        
        it('should return a user without password', () => {

            return request(app.getHttpServer())
                .post('/auth/register')
                .send(mockCreateUser)
                .expect(201)
                .expect(mockCreateResponse);
        });
    });

    afterEach(() => app.close())

});
