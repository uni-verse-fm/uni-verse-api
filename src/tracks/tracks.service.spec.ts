import { Test, TestingModule } from '@nestjs/testing';
import { TracksService } from './tracks.service';
import * as data from '../test-utils/data/mock_data.json';
import { data2list } from '../test-utils/mocks/standard-mock.service.test';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './schemas/track.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';

const users = data.users;
const tracks = data.tracks;

const artists_emails = [
  users.jayz.email,
  users.abdou.email,
  users.pharrell.email,
  users.kanye.email,
];
const create_artists = data2list(data.create_users).filter((users) =>
  artists_emails.includes(users.email),
);

const track_titles = [
  tracks.encore.title,
  tracks.change_clothes.title,
  tracks.threat.title,
];
const black_album_tracks = data2list(data.tracks).filter((track) =>
  track_titles.includes(track.title),
);

const create_tracks = data2list(data.create_tracks);

describe('TracksService', () => {
  let tracksService: TracksService;
  let usersService: UsersService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
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
      providers: [TracksService, FilesService, UsersService],
    }).compile();

    tracksService = module.get<TracksService>(TracksService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('create tracks', () => {
    create_artists.forEach((user) => {
      it('', async () => {
        const createdUser = await usersService.create(user);
        expect(createdUser.email).toBe(user.email);
        expect(createdUser.username).toBe(user.username);
      });
    });

    create_tracks.forEach((track) => {
      it(`should return track ${track.title} infos`, async () => {
        const author = await usersService.findUserByEmail(track.author.email);
        const trackFileUrl = 'https://track-example.com';
        const feats = await Promise.all(
          track.feats.map((feat: { email: string }) =>
            usersService.findUserByEmail(feat.email),
          ),
        );

        const body = {
          ...track,
          buffer: Buffer.from(JSON.parse(JSON.stringify(track.buffer))),
          author,
        };

        const result = await tracksService.create(body);
        expect(result.author).toBe(author);
        expect(result.feats).toStrictEqual(
          feats.map((feat) => ({
            _id: feat._id,
            username: feat.username,
            email: feat.email,
          })),
        );
        expect(result.title).toBe(track.title);
        expect(result.trackFileUrl).toBe(trackFileUrl);
      });
    });
  });

  describe('When ask for all tracks', () => {
    it('should return a list of tracks', async () => {
      const expected = black_album_tracks.map((track) => ({
        title: track.title,
        trackFileUrl: track.trackFileUrl,
      }));

      const result = await tracksService.findAll();
      const cleanedResult = result.map((track) => ({
        title: track.title,
        trackFileUrl: track.trackFileUrl,
      }));

      expect(cleanedResult).toStrictEqual(expected);

      result.forEach((track) => {
        expect(track._id).toBeDefined();
        expect(track.author).toBeDefined();
        expect(track.feats).toBeDefined();
      });
    });
  });

  describe('When ask one track by id', () => {
    it('should return one track', async () => {
      const track = await tracksService.findByTitle(
        tracks.change_clothes.title,
      );

      const result = await tracksService.findOne(track._id);
      expect(result).toStrictEqual(track);
    });
  });

  describe('When ask one track by title', () => {
    const title = 'change clothes';
    const trackFileUrl = 'https://track-example.com';

    it('should return one track', async () => {
      const result = await tracksService.findByTitle(
        tracks.change_clothes.title,
      );
      expect(result._id).toBeDefined();
      expect(result.title).toBe(title);
      expect(result.author).toBeDefined();
      expect(result.feats).toBeDefined();
      expect(result.trackFileUrl).toBe(trackFileUrl);
    });
  });

  describe('When remove one track', () => {
    it('should return one track infos', async () => {
      const track = await tracksService.findByTitle(
        tracks.change_clothes.title,
      );
      const expected = {
        id: track._id,
        title: track.title,
        msg: 'Track deleted',
      };

      const result = await tracksService.remove(track._id);
      expect(result).toStrictEqual(expected);
    });
  });
});
