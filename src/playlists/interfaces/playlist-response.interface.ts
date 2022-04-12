import { ITrackResponse } from '../../tracks/interfaces/track-response.interface';
import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IPlaylistResponse {
  id: string;
  title: string;
  owner: IUserResponse;
  track: ITrackResponse[];
}
