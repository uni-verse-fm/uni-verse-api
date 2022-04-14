import { ObjectId } from 'mongodb';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface ICreateResourceResponse {
  _id: ObjectId;
  title: string;
  fileName: string;
  author: IUserResponse;
}
