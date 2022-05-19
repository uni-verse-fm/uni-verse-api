import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/in-memory/mongoose.helper.test';
import { Track, TrackSchema } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { User, UserDocument, UserSchema } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { PlaylistsService } from './playlists.service';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import * as data from '../test-utils/data/mock_data.json';
import { ICreateTrackResponse } from '../tracks/interfaces/track-create-response.interface';
import { FilesService } from '../files/files.service';
import { PaymentsService } from '../payments/payments.service';
import { NonValidIdException } from '../utils/is-valid-id';
import { FileMimeType } from '../files/dto/simple-create-file.dto';
import { MinioServiceMock } from '../test-utils/mocks/minio.service.test';
import { UserSearchServiceMock } from '../test-utils/mocks/users-search.service.test';

const abdou = data.users.abdou;
const jayz = data.users.jayz;
const encoreTrack = data.create_tracks.encore;
const threatTrack = data.create_tracks.threat;
const my_playlist1 = data.create_playlists.my_playlist1;
const my_playlist2 = data.create_playlists.my_playlist2;

let user: UserDocument;
let artist: UserDocument;
let encore: ICreateTrackResponse;
let threat: ICreateTrackResponse;
let playlist1_id: string;
let playlist2_id: string;

describe('PlaylistsService', () => {
  let playlistService: PlaylistsService;
  let usersService: UsersService;
  let tracksService: TracksService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: Playlist.name,
            schema: PlaylistSchema,
          },
          {
            name: Track.name,
            schema: TrackSchema,
          },
          {
            name: User.name,
            schema: UserSchema,
          },
        ])
      ],
      providers: [
        PlaylistsService,
        TracksService,
        UsersService,
        FilesService,
        MinioServiceMock,
        {
          provide: PaymentsService,
          useValue: {
            createCustomer: jest.fn(() => {
              return { id: 1 };
            }),
          },
        },
        UserSearchServiceMock
      ],
    }).compile();

    playlistService = module.get<PlaylistsService>(PlaylistsService);
    usersService = module.get<UsersService>(UsersService);
    tracksService = module.get<TracksService>(TracksService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
      await closeInMongodConnection();
    }
  });

  describe('When create one playlist', () => {
    it('', async () => {
      const createdUser = await usersService.createUser(
        data.create_users.abdou,
      );
      const createdArtist = await usersService.createUser(
        data.create_users.jayz,
      );
      user = await usersService.findUserByEmail(createdUser.email);
      artist = await usersService.findUserByEmail(createdArtist.email);
      expect(user.email).toBe(abdou.email);
      expect(user.username).toBe(abdou.username);
      expect(artist.email).toBe(jayz.email);
      expect(artist.username).toBe(jayz.username);
    });

    it('', async () => {
      const encoreBuffer = Buffer.from(
        JSON.parse(JSON.stringify(encoreTrack.buffer)),
      );
      const threatBuffer = Buffer.from(
        JSON.parse(JSON.stringify(threatTrack.buffer)),
      );
      const commonTrackInfos = {
        fileName: 'https://www.example.com',
        feats: [],
        author: artist,
      };
      encore = await tracksService.createTrack({
        ...commonTrackInfos,
        title: encoreTrack.title,
        file: {
          originalFileName: encoreTrack.originalFileName,
          buffer: Buffer.from(JSON.parse(JSON.stringify(encoreTrack.buffer))),
          size: 4000,
          mimetype: FileMimeType.MPEG,
        },
        originalFileName: encoreTrack.originalFileName,
      });
      threat = await tracksService.createTrack({
        ...commonTrackInfos,
        title: threatTrack.title,
        file: {
          originalFileName: threatTrack.originalFileName,
          buffer: Buffer.from(JSON.parse(JSON.stringify(threatTrack.buffer))),
          size: 4000,
          mimetype: FileMimeType.MPEG,
        },
        originalFileName: threatTrack.originalFileName,
      });
      expect(encore.id).toBeDefined();
      expect(threat.id).toBeDefined();
    });

    it('should return the first playlist', async () => {
      const playlist = await playlistService.createPlaylist(my_playlist1, user);
      playlist1_id = playlist._id;
      expect(playlist._id).toBeDefined();
      expect(playlist.title).toBe(my_playlist1.title);
    });

    it('should return the second playlist', async () => {
      const playlist = await playlistService.createPlaylist(my_playlist2, user);
      playlist2_id = playlist._id;
      expect(playlist._id).toBeDefined();
      expect(playlist.title).toBe(my_playlist2.title);
    });
  });

  describe('When find all playlists', () => {
    it('should return a list of releases', async () => {
      const playlists = await playlistService.findAllPlaylists();
      expect(playlists.length).toBe(2);
      expect(playlists[0].title).toBe(my_playlist1.title);
      expect(playlists[0].owner).toBeDefined();
      expect(playlists[0]._id).toBeDefined();
      expect(playlists[1].title).toBe(my_playlist2.title);
      expect(playlists[1].owner).toBeDefined();
      expect(playlists[1]._id).toBeDefined();
    });
  });

  describe('When find one playlist by title', () => {
    it('should return one release', async () => {
      const result = await playlistService.findPlaylsitByTitle(
        my_playlist2.title,
      );

      expect(result.title).toBe(my_playlist2.title);
      expect(result.owner).toStrictEqual(user._id);
      expect(result.tracks).toBeDefined();
    });
  });

  describe('When find one playlist by id', () => {
    it('should return one release', async () => {
      const result = await playlistService.findPlaylistById(playlist1_id);

      expect(result.title).toBe(my_playlist1.title);
      expect(result.owner).toStrictEqual(user._id);
      expect(result.tracks).toBeDefined();
    });
  });

  describe('When find one playlist by id', () => {
    it('should return an exception of id invalidity', async () => {
      await expect(() => playlistService.findPlaylistById('1')).rejects.toThrow(
        NonValidIdException,
      );
    });
  });

  describe('When remove one playlist', () => {
    const msg = 'Playlist deleted';

    it('should return one playlist infos', async () => {
      const result = await playlistService.removePlaylist(playlist1_id, user);
      expect(result.id).not.toBe('');
      expect(result.id).not.toBe(playlist2_id);
      expect(result.title).toBe(my_playlist1.title);
      expect(result.msg).toBe(msg);
    });

    it('should return the second playlist infos', async () => {
      const result = await playlistService.removePlaylist(playlist2_id, user);

      expect(result.id).not.toBe('');
      expect(result.id).not.toBe(playlist1_id);
      expect(result.title).toBe(my_playlist2.title);
      expect(result.msg).toBe(msg);
    });
  });
});
