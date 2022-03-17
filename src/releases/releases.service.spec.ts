import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as mongoose from 'mongoose';
import RepoMockModel, {
  data2list,
} from '../test-utils/mocks/standard-mock.service';
import { User } from '../users/schemas/user.schema';
import { ReleasesService } from './releases.service';
import { Release } from './schemas/release.schema';
import * as data from '../test-utils/data/mock_data.json';
import { Track } from '../tracks/schemas/track.schema';
import { TracksService } from '../tracks/tracks.service';
import { FilesService } from '../files/files.service';

const release = data.releases.black_album;
const release1 = data.releases.wtt;
const create_wtt = data.create_release.wtt;

const tracks = [
  data.create_tracks.change_clothes,
  data.create_tracks.encore,
  data.create_tracks.threat,
];

const releases = data2list(data.releases);
const files = data2list(data.create_files);

const author = data.users.jayz;

describe('ReleasesService', () => {
  let releasesService: ReleasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        TracksService,
        FilesService,
        {
          provide: getModelToken(Release.name),
          useValue: new RepoMockModel(data.releases),
        },
        {
          provide: getModelToken(User.name),
          useValue: new RepoMockModel(data.users),
        },
        {
          provide: getModelToken(Track.name),
          useValue: new RepoMockModel(data.tracks),
        },
      ],
    }).compile();

    releasesService = module.get<ReleasesService>(ReleasesService);
  });

  describe('When create one release', () => {
    const authorParam: User = {
      ...author,
      _id: new mongoose.Schema.Types.ObjectId(author._id),
      releases: [],
    };

    const create_release = {
      ...create_wtt,
      tracks: tracks.map((track) => ({
        ...track,
        buffer: Buffer.from(JSON.parse(JSON.stringify(track.buffer))),
      })),
    };

    const files_release = files.map((track) => ({
      ...track,
      buffer: Buffer.from(JSON.parse(JSON.stringify(track.buffer))),
    }));

    const feats = release1.feats.map((feat) => ({
      ...feat,
      _id: new mongoose.Schema.Types.ObjectId(feat._id),
      releases: [],
    }));

    const expected = {
      title: release1.title,
      description: release1.description,
      coverUrl: release1.coverUrl,
      author: {
        id: author._id,
        username: author.username,
        email: author.email,
      },
      feats: release1.feats.map((feat) => ({
        id: feat._id,
        username: feat.username,
        email: feat.email,
      })),
    };
    it('should return one release infos', async () => {
      const result = await releasesService.create(
        files_release,
        create_release,
        authorParam,
        feats,
      );
      expect(result).toStrictEqual(expected);
    });
  });

  describe('When find all rleases', () => {
    it('should return a list of releases', async () => {
      const result = await releasesService.findAll();
      expect(result).toStrictEqual(releases);
    });
  });

  describe('When find one release by id', () => {
    it('should return one release', async () => {
      const result = await releasesService.findOne(release._id);
      expect(result).toStrictEqual(release);
    });
  });

  describe('When find one release by title', () => {
    it('should return one release', async () => {
      const result = await releasesService.findByTitle(release.title);
      expect(result).toStrictEqual(release);
    });
  });

  describe('When remove one release', () => {
    const expected = {
      id: release._id,
      title: release.title,
      msg: 'Release deleted',
    };
    it('should return one release infos', async () => {
      const result = await releasesService.remove(release._id);
      expect(result).toStrictEqual(expected);
    });
  });
});
