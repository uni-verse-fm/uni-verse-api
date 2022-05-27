import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';
import { ReleasesService } from '../../releases/releases.service';

const release = data.releases.black_album;
const releases = data2list(data.releases);

const release_wtt = data.releases.wtt;

const author = data.users.jayz;

const create_expected = {
  title: release_wtt.title,
  description: release_wtt.description,
  coverName: release_wtt.coverName,
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

export const ReleasesServiceMock = {
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
};
