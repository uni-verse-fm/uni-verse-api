import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IReleaseResponse {
  title: string;
  description: string;
  coverUrl: string;
  author: IUserResponse;
  feats: IUserResponse[];
}
