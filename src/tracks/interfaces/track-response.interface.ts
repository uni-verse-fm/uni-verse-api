import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface ITrackResponse {
  title: string;
  trackFileUrl: string;
  author: IUserResponse;
  feats: IUserResponse[];
}
