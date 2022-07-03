/* Copyright (c) 2022 uni-verse corp */

import { ObjectId } from 'mongodb';
export interface IDeleteResourceResponse {
  id: ObjectId;
  title: string;
  msg: string;
}
