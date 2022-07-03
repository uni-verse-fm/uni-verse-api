/* Copyright (c) 2022 uni-verse corp */

import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IPlaylistResponse {
  id: string;
  title: string;
  owner: IUserResponse;
}
