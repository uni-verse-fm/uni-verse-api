import { ObjectId } from 'mongodb';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IResourceResponse {
  _id: ObjectId;
  title: string;
  resourceFileUrl: string;
  author: IUserResponse;
}
