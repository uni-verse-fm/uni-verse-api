import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import * as data from '../test-utils/data/mock_data.json';
import { Release } from './schemas/release.schema';
import RepoMockModel, {
  data2list,
} from '../test-utils/mocks/standard-mock.service.test';
import { TracksService } from '../tracks/tracks.service';
import { Track } from '../tracks/schemas/track.schema';
import { FilesService } from '../files/files.service';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import TracksRepoMockModel from '../test-utils/mocks/Tracks-mock.service.test';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';

const release = data.releases.black_album;
const releases = data2list(data.releases);

const release_wtt = data.releases.wtt;

const create_release = data.create_releases.wtt;

const author = data.users.jayz;

const create_expected = {
  title: release_wtt.title,
  description: release_wtt.description,
  coverUrl: release_wtt.coverUrl,
  author: {
    id: author._id,
    username: author.username,
    email: author.email,
  },
  feats: release_wtt.feats.map((feat) => ({
    id: feat._id,
    username: feat.username,
    email: feat.email,
  })),
};

const delete_expected = {
  id: release._id,
  title: release.title,
  msg: 'Release deleted',
};

describe('ReleasesController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule()],
      controllers: [ReleasesController],
      providers: [
        TracksService,
        FilesService,
        UsersService,
        {
          provide: ReleasesService,
          useValue: {
            createRelease: jest.fn(() => {
              return {
                ...create_expected,
              };
            }),
            findAllReleases: jest.fn(() => {
              return releases;
            }),
            findReleaseById: jest.fn(() => {
              return {
                ...release,
              };
            }),
            updateRelease: jest.fn(() => {
              return {};
            }),
            removeRelease: jest.fn(() => {
              return {
                ...delete_expected,
              };
            }),
            find: jest.fn(() => {
              return releases;
            }),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users, 4, 2),
        },
        {
          provide: getModelToken(Release.name),
          useValue: new RepoMockModel(data.releases),
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
          req.user = { id: '0' };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('find all releases', () => {
    it('shoul return all releases', () => {
      return request(app.getHttpServer())
        .get('/releases')
        .expect(200)
        .expect(releases);
    });
  });

  describe('find one release by id', () => {
    it('shoul return one release', () => {
      return request(app.getHttpServer())
        .get(`/releases/${release._id}`)
        .expect(200)
        .expect(release);
    });
  });

  describe('create a release', () => {
    const files_data = create_release.tracks.map((track) =>
      Buffer.from(track.title),
    );

    it('should return a release', () => {
      return request(app.getHttpServer())
        .post('/releases')
        .field('data', JSON.stringify(create_release))
        .attach('files', files_data[0], 'track_1')
        .attach('files', files_data[1], 'track_2')
        .attach('files', files_data[2], 'track_3')
        .expect(create_expected);
    });
  });

  describe('delete my release', () => {
    it('should return the release', async () => {
      return await request(app.getHttpServer())
        .delete(`/releases/${release._id}`)
        .expect(delete_expected);
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
    app.close();
  });
});
