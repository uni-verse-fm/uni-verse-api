/* Copyright (c) 2022 uni-verse corp */

import ICreateUser from '../../users/interfaces/create-user.interface';

export default interface ICreateTrack {
  title: string;
  originalFileName: string;
  author: ICreateUser;
  feats: ICreateUser[];
}
