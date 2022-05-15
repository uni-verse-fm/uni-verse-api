import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { data2list } from '../test-utils/mocks/standard-mock.service.test';
import { User, UserDocument, UserSchema } from '../users/schemas/user.schema';
import { ReleasesService } from './releases.service';
import { Release, ReleaseSchema } from './schemas/release.schema';
import * as data from '../test-utils/data/mock_data.json';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';
import { MinioClientService } from '../minio-client/minio-client.service';
import { PaymentsService } from '../payments/payments.service';

const release = data.releases.black_album;

const users = data.users;

const create_releases = data2list(data.create_releases);
const files = data2list(data.create_files);

const artists_emails = [
  users.jayz.email,
  users.pharrell.email,
  users.kanye.email,
];
const create_artists = data2list(data.create_users).filter((users) =>
  artists_emails.includes(users.email),
);

describe('ReleasesService', () => {
  let releasesService: ReleasesService;
  let usersService: UsersService;
  let module: TestingModule;
  let releaseId: string;
  let author: UserDocument;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: Release.name,
            schema: ReleaseSchema,
          },
          {
            name: Track.name,
            schema: TrackSchema,
          },
          {
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [
        ReleasesService,
        TracksService,
        FilesService,
        UsersService,
        {
          provide: MinioClientService,
          useValue: {
            upload: jest.fn(() => {
              return 'https://www.example.com';
            }),
          },
        },
        {
          provide: PaymentsService,
          useValue: {
            createCustomer: jest.fn(() => {
              return { id: 1 };
            }),
          },
        },
      ],
    }).compile();

    releasesService = module.get<ReleasesService>(ReleasesService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('When create one release', () => {
    create_artists.forEach((user) => {
      it('', async () => {
        const createdUser = await usersService.createUser(user);
        expect(createdUser.email).toBe(user.email);
        expect(createdUser.username).toBe(user.username);
        author = await usersService.findUserByEmail(users.jayz.email);
        expect(author.id).toBeDefined();
      });
    });

    create_releases.forEach((release, releaseIndex) => {
      const test = files[releaseIndex];
      const files_release = (test as Array<any>).map((file) => ({
        ...file,
        buffer: Buffer.from(JSON.parse(JSON.stringify(file.buffer))),
      }));

      it('should return one release infos', async () => {
        const tracks = data2list(release.tracks);

        const feat_list_from_data = data2list(release.feats);

        const feats = await Promise.all(
          feat_list_from_data.map((feat) =>
            usersService.findUserByEmail(feat.email),
          ),
        );

        const feats_info = feats.map((feat) => ({
          email: feat.email,
          id: feat._id,
          username: feat.username,
        }));

        const create_release = {
          ...release,
          tracks,
          feats: feats_info,
        };

        const expected = {
          title: release.title,
          description: release.description,
          coverUrl: release.coverUrl,
          author: {
            id: author._id.toString(),
            username: author.username,
            email: author.email,
          },
          feats: feats_info.map((feat) => ({
            id: feat.id.toString(),
            username: feat.username,
            email: feat.email,
          })),
        };

        const result = await releasesService.createRelease(
          files_release,
          create_release,
          author,
        );
        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('When find all rleases', () => {
    it('should return a list of releases', async () => {
      const releases_list = data2list([
        data.releases.black_album,
        data.releases.wtt,
      ]);

      const expected = releases_list.map((release) => ({
        title: release.title,
        description: release.description,
        coverUrl: release.coverUrl,
        author: author._id.toString(),
      }));

      const result = await releasesService.findAllReleases();

      const cleanedResult = result.map((release) => ({
        title: release.title,
        description: release.description,
        coverUrl: release.coverUrl,
        author: release.author._id.toString(),
      }));
      expect(cleanedResult).toStrictEqual(expected);

      result.forEach((release) => {
        expect(release.feats).toBeDefined();
      });
    });
  });

  describe('When find one release by title', () => {
    it('should return one release', async () => {
      const coverUrl = 'https://www.release.com';
      const description = 'one of the greatest';
      const title = 'balck album';

      const result = await releasesService.findReleaseByTitle(release.title);

      releaseId = result._id.toString();

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.coverUrl).toBe(coverUrl);
      expect(result.author).toStrictEqual(author._id);
      expect(result.feats).toBeDefined();
      expect(result.tracks).toBeDefined();
    });
  });

  describe('When find one release by id', () => {
    it('should return one release', async () => {
      const coverUrl = 'https://www.release.com';
      const description = 'one of the greatest';
      const title = 'balck album';

      const result = await releasesService.findReleaseById(releaseId);

      expect(result.title).toBe(title);
      expect(result.description).toBe(description);
      expect(result.coverUrl).toBe(coverUrl);
      expect(result.author).toStrictEqual(author._id);
      expect(result.feats).toBeDefined();
      expect(result.tracks).toBeDefined();
    });
  });

  describe('When remove one release', () => {
    it('should return one release infos', async () => {
      const title = 'balck album';
      const msg = 'Release deleted';

      const result = await releasesService.removeRelease(releaseId, author);
      expect(result.id).toStrictEqual(releaseId);
      expect(result.title).toStrictEqual(title);
      expect(result.msg).toStrictEqual(msg);
    });
  });
});
