/* Copyright (c) 2022 uni-verse corp */

import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IReleaseResponse {
  title: string;
  description: string;
  coverName: string;
  author: IUserResponse;
  feats: IUserResponse[];
}
