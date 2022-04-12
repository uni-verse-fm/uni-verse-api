import { ObjectId } from 'mongodb';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IDeleteResourceResponse {
  id: ObjectId;
  title: string;
  msg: string;
}
