import { PlaylistsService } from '../../playlists/playlists.service';
import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';

const playlists = data2list(data.playlists);

const playlist1 = data.playlists.fav_1;

const create_expected = {
  title: playlist1.title,
  owner: playlist1.owner,
  tracks: playlist1.tracks,
};

const delete_expected = {
  id: playlist1._id,
  title: playlist1.title,
  msg: 'Playlist deleted',
};

export const PlaylistsServiceMock = {
  provide: PlaylistsService,
  useValue: {
    createPlaylist: jest.fn(() => {
      return {
        ...create_expected,
      };
    }),
    findAllPlaylists: jest.fn(() => {
      return playlists;
    }),
    findPlaylistById: jest.fn(() => {
      return {
        ...playlist1,
      };
    }),
    updatePlaylist: jest.fn(() => {
      return {};
    }),
    removePlaylist: jest.fn(() => {
      return {
        ...delete_expected,
      };
    }),
    find: jest.fn(() => {
      return playlists;
    }),
  },
};
