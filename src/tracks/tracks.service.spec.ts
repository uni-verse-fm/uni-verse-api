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
import { FileMimeType } from '../files/dto/simple-create-file.dto';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';
import { PaymentServiceMock } from '../test-utils/mocks/payment.service.test';
import { TrackSearchServiceMock } from '../test-utils/mocks/tracks-search.service.test';
import { RmqServiceMock } from 'src/test-utils/mocks/rmq.service.test';

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
      providers: [
        TracksService,
        FilesService,
        UsersService,
        MinioServiceMock,
        RmqServiceMock,
        PaymentServiceMock,
        UserSearchServiceMock,
        TrackSearchServiceMock,
      ],
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
        const createdUser = await usersService.createUser(user);
        expect(createdUser.email).toBe(user.email);
        expect(createdUser.username).toBe(user.username);
      });
    });

    create_tracks.forEach((track) => {
      it(`should return track ${track.title} infos`, async () => {
        const author = await usersService.findUserByEmail(track.author.email);
        const fileName = 'https://www.example.com';
        const feats = await Promise.all(
          track.feats.map((feat: { email: string }) =>
            usersService.findUserByEmail(feat.email),
          ),
        );

        const body = {
          ...track,
          file: {
            originalFileName: track.originalFileName,
            buffer: Buffer.from(JSON.parse(JSON.stringify(track.buffer))),
            size: 4000,
            mimetype: FileMimeType.MPEG,
          },
          author,
        };

        const result = await tracksService.createTrack(body);
        expect(result.author.id).toBe(author.id);
        expect(result.feats).toStrictEqual(
          feats.map((feat) => ({
            id: feat._id.toString(),
            username: feat.username,
            email: feat.email,
            profilePicture: undefined,
          })),
        );
        expect(result.title).toBe(track.title);
        expect(result.fileName).toBe(fileName);
      });
    });
  });

  describe('When ask for all tracks', () => {
    it('should return a list of tracks', async () => {
      const expected = black_album_tracks.map((track) => ({
        title: track.title,
        fileName: track.fileName,
      }));

      const result = await tracksService.findAllTracks();
      const cleanedResult = result.map((track) => ({
        title: track.title,
        fileName: track.fileName,
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
      const track = await tracksService.findTrackByTitle(
        tracks.change_clothes.title,
      );

      const result = await tracksService.findTrackById(track._id);
      expect(result).toStrictEqual(track);
    });
  });

  describe('When ask one track by title', () => {
    const title = 'change clothes';
    const fileName = 'https://www.example.com';

    it('should return one track', async () => {
      const result = await tracksService.findTrackByTitle(
        tracks.change_clothes.title,
      );
      expect(result._id).toBeDefined();
      expect(result.title).toBe(title);
      expect(result.author).toBeDefined();
      expect(result.feats).toBeDefined();
      expect(result.fileName).toBe(fileName);
    });
  });

  describe('When remove one track', () => {
    it('should return one track infos', async () => {
      const track = await tracksService.findTrackByTitle(
        tracks.change_clothes.title,
      );
      const expected = {
        id: track._id,
        title: track.title,
        msg: 'Track deleted',
      };

      const result = await tracksService.removeTrack(track._id);
      expect(result).toStrictEqual(expected);
    });
  });
});
