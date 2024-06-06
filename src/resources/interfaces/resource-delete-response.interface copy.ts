/* Copyright (c) 2022 uni-verse corp */

import { ObjectId } from 'mongoose';
export interface IDeleteResourceResponse {
  id: ObjectId;
  title: string;
  msg: string;
}
