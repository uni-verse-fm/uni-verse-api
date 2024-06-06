/* Copyright (c) 2022 uni-verse corp */

import { ObjectId } from 'mongoose';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface ICreateResourceResponse {
  _id: ObjectId;
  title: string;
  fileName: string;
  author: IUserResponse;
}
