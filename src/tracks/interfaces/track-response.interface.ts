import { ObjectId } from 'mongodb';
import AuthorDto from '../../users/dto/author.dto';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface ITrackResponse {
  _id: ObjectId;
  title: string;
  trackFileUrl: string;
  author: IUserResponse;
  feats: AuthorDto[];
}
