import { ObjectId } from 'mongodb';
import AuthorDto from '../../users/dto/author.dto';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface ICreateTrackResponse {
  id: ObjectId;
  title: string;
  fileName: string;
  author: IUserResponse;
  feats: AuthorDto[];
}
