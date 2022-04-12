import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IPlaylistResponse {
  id: string;
  title: string;
  owner: IUserResponse;
}
