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
import { PlaylistsService } from './playlists.service';
import { TracksService } from '../tracks/tracks.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import TracksRepoMockModel from '../test-utils/mocks/Tracks-mock.service.test';
import { Track } from '../tracks/schemas/track.schema';

const playlists = data2list(data.playlists);

const playlist1 = data.playlists.fav_1;

const create_playlist = data.create_playlists.my_playlist1;

const author = data.users.jayz;

const create_expected = {
  title: playlist1.title,
  owner: playlist1.owner,
  tracks: playlist1.tracks,
};

const delete_expected = {
  id: playlist1._id,
  title: playlist1.title,
  msg: 'Playlist deleted',
};

describe('PlaylistsController', () => {
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
      controllers: [PlaylistsController],
      providers: [
        TracksService,
        FilesService,
        UsersService,
        {
          provide: PlaylistsService,
          useValue: {
            createPlaylist: jest.fn(() => {
              return {
                ...create_expected,
              };
            }),
            findAllPlaylists: jest.fn(() => {
              return playlists;
            }),
            findPlaylistById: jest.fn(() => {
              return {
                ...playlist1,
              };
            }),
            updatePlaylist: jest.fn(() => {
              return {};
            }),
            removePlaylist: jest.fn(() => {
              return {
                ...delete_expected,
              };
            }),
            find: jest.fn(() => {
              return playlists;
            }),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users, 4, 2),
        },
        {
          provide: getModelToken(Track.name),
          useValue: new TracksRepoMockModel(data.tracks),
        },
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
    it('shoul return one comment', () => {
      return request(app.getHttpServer())
        .get(`/playlists/${playlist1._id}`)
        .expect(200)
        .expect(playlist1);
    });
  });

  describe('create a playlist', () => {
    it('should return a playlist', () => {
      return request(app.getHttpServer())
        .post('/playlists')
        .send(create_playlist)
        .expect(create_expected);
    });
  });

  describe('Delete my playlist', () => {
    const expected = {
      id: playlist1._id,
      title: playlist1.title,
      msg: 'Playlist deleted',
    };

    it('should return an title with a message', async () => {
      return await request(app.getHttpServer())
        .delete('/playlists/' + playlist1._id)
        .expect(expected);
    });
  });

  afterAll((done) => {
    app.close();
    done();
  });
});
