/* Copyright (c) 2022 uni-verse corp */

import { ObjectId } from 'mongodb';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface ITrackResponse {
  id: ObjectId;
  title: string;
  fileName: string;
  author: IUserResponse;
  feats: IUserResponse[];
}
