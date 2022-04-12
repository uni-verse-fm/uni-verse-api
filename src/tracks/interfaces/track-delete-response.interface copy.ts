import { ObjectId } from 'mongodb';

export interface IDeleteTrackResponse {
  id: ObjectId;
  title: string;
  msg: string;
}
