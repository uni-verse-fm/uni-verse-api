import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';
import ReleasesSearchService from '../../releases/releases-search.service';

const release = data.releases.black_album;
const releases = data2list(data.releases).map((release) => ({
  id: release._id,
  title: release.title,
}));
const findByTitleExpected = {
  id: release._id,
  title: release.title,
};
const delete_expected = {
  title: release.title,
};

export const ReleasesSearchServiceMock = {
  provide: ReleasesSearchService,
  useValue: {
    insertIndex: jest.fn(() => {
      return {
        ...release,
      };
    }),
    searchIndex: jest.fn((title: string) => {
      return title ? findByTitleExpected : releases;
    }),
    updateIndex: jest.fn(() => {
      return {};
    }),
    deleteIndex: jest.fn(() => {
      return {
        ...delete_expected,
      };
    }),
  },
};
