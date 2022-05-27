import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';
import PlaylistsSearchService from '../../playlists/playlists-search.service';

const playlist = data.playlists.fav_1;
const playlists = data2list(data.playlists).map((playlist) => ({
  id: playlist._id,
  title: playlist.title,
}));
const findByTitleExpected = {
  id: playlist._id,
  title: playlist.title,
};
const delete_expected = {
  title: playlist.title,
};

export const PlaylistsSearchServiceMock = {
  provide: PlaylistsSearchService,
  useValue: {
    insertIndex: jest.fn(() => {
      return {
        ...playlist,
      };
    }),
    searchIndex: jest.fn((title: string) => {
      return title ? findByTitleExpected : playlists;
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
