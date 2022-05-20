import { ObjectId } from 'mongodb';
export interface IDeleteResourceResponse {
  id: ObjectId;
  title: string;
  msg: string;
}
