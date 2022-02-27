import * as bcrypt from 'bcrypt';

const password = "$2b$10$v5vECbZOx0ybssiOkrS/o.s7Q6ejf/bri2jwH8WW48trelGBdW3Mm";

export const mockUsers = [
  {
    _id: '0',
    username: '96abdou96',
    email: '96abdou96@gmail.com',
    password: password,
  },
  {
    _id: '1',
    username: 'Vagahbond',
    email: 'Vagahbond@gmail.com',
    password: password,
  },
  {
    _id: '2',
    username: 'Marx',
    email: 'marxou@gmail.com',
    password: password,
  },
];

export const mockCreateUser = {
  username: 'Picola',
  email: 'picola.le.vert@gmail.com',
  password: 'PicoLaMoula',
};

export const mockCreateResponse = {
  username: 'Picola',
  email: 'picola.le.vert@gmail.com',
};

export const mockLoginUser = {
  email: 'Vagahbond@gmail.com',
  password: 'VagaLaFrappe ',
};

export const mockLoginResponse = {
  username: 'Vagahbond',
  email: 'Vagahbond@gmail.com',
  jwt: '',
};
