/* Copyright (c) 2022 uni-verse corp */

import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlaylistsController } from './playlists.controller';
import * as data from '../test-utils/data/mock_data.json';
import { UsersService } from '../users/users.service';
import * as request from 'supertest';
import { FilesService } from '../files/files.service';
import RepoMockModel, {
  data2list,
} from '../test-utils/mocks/standard-mock.service.test';
import { TracksService } from '../tracks/tracks.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import TracksRepoMockModel from '../test-utils/mocks/Tracks-mock.service.test';
import { Track } from '../tracks/schemas/track.schema';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { PaymentServiceMock } from '../test-utils/mocks/payment.service.test';
import { TrackSearchServiceMock } from '../test-utils/mocks/tracks-search.service.test';
import { PlaylistsSearchServiceMock } from '../test-utils/mocks/playlists-search.service.test';
import { PlaylistsServiceMock } from '../test-utils/mocks/playlists.service.test';
import { AmqpConnectionMock } from '../test-utils/mocks/rabbit.connection.test';

const playlists = data2list(data.playlists);

const playlist1 = data.playlists.fav_1;

const author = data.users.jayz;

describe('PlaylistsController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
            signOptions: { expiresIn: '6000s' },
          }),
        }),
      ],
      controllers: [PlaylistsController],
      providers: [
        TracksService,
        FilesService,
        UsersService,
        ConfigService,
        PlaylistsServiceMock,
        MinioServiceMock,
        PaymentServiceMock,
        AmqpConnectionMock,
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users, 4, 2),
        },
        {
          provide: getModelToken(Track.name),
          useValue: new TracksRepoMockModel(data.tracks),
        },
        UserSearchServiceMock,
        TrackSearchServiceMock,
        PlaylistsSearchServiceMock,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = author;
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('Find all playlists', () => {
    it('should return all playlists', async () => {
      return request(app.getHttpServer())
        .get('/playlists')
        .expect(200)
        .expect(playlists);
    });
  });

  describe('find one playlist by id', () => {
    it('shoul return one playlist', () => {
      return request(app.getHttpServer())
        .get(`/playlists/${playlist1._id}`)
        .expect(200)
        .expect(playlist1);
    });
  });

  afterAll((done) => {
    app.close();
    done();
  });
});
