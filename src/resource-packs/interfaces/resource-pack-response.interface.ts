/* Copyright (c) 2022 uni-verse corp */

import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IResourcePackResponse {
  title: string;
  description: string;
  coverName: string;
  author: IUserResponse;
}
