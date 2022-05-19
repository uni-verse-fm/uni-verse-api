import { UsersService } from '../../users/users.service';
import { data2list } from './standard-mock.service.test';
import * as data from '../data/mock_data.json';

const user = data.users.kanye;
const yoni = data.users.yoni;
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

export const UsersServiceMock = {
  provide: UsersService,
  useValue: {
    findUserByUsername: jest.fn(() => {
      return {
        ...user,
      };
    }),
    findUserByEmail: (email: string) =>
      users.find((user) => user.email === email),
    findUsers: jest.fn((username: string) => {
      return username ? findByUsernameExpected : users;
    }),
    findUserById: jest.fn(() => {
      return {
        ...user,
      };
    }),
    updateUser: jest.fn(() => {
      return {};
    }),
    removeUser: jest.fn(() => {
      return {
        ...delete_expected,
      };
    }),
    find: jest.fn(() => {
      return users;
    }),
    createUser: () => ({
      username: yoni.username,
      email: yoni.email,
    }),
  },
};
