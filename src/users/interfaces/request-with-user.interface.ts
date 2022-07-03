/* Copyright (c) 2022 uni-verse corp */

import { Request } from 'express';
import { UserDocument } from '../schemas/user.schema';
export interface IRequestWithUser extends Request {
  readonly user: UserDocument;
}
