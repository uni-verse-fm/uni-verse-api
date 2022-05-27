import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';
import TracksSearchService from '../../tracks/tracks-search.service';

const track = data.tracks.change_clothes;
const tracks = data2list(data.tracks).map((track) => ({
  id: track._id,
  username: track.username,
  email: track.email,
}));
const findByTitleExpected = {
  id: track._id,
  title: track.title,
};
const delete_expected = {
  title: track.title,
};

export const TrackSearchServiceMock = {
  provide: TracksSearchService,
  useValue: {
    insertIndex: jest.fn(() => {
      return {
        ...track,
      };
    }),
    searchIndex: jest.fn((title: string) => {
      return title ? findByTitleExpected : tracks;
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
