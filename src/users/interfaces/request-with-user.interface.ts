import { Request } from 'express';
import { UserDocument } from '../schemas/user.schema';
export interface IRequestWithUser extends Request {
  readonly user: UserDocument;
}
