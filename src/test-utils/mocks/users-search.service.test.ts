/* Copyright (c) 2022 uni-verse corp */

import UsersSearchService from '../../users/users-search.service';
import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';

const user = data.users.kanye;
const users = data2list(data.users).map((user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
}));
const findByUsernameExpected = {
  id: user._id,
  username: user.username,
  email: user.email,
};
const delete_expected = {
  email: user.email,
  msg: 'user deleted',
};

export const UserSearchServiceMock = {
  provide: UsersSearchService,
  useValue: {
    insertIndex: jest.fn(() => {
      return {
        ...user,
      };
    }),
    searchIndex: jest.fn((username: string) => {
      return username ? findByUsernameExpected : users;
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
