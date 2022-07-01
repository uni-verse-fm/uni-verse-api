import { ITrackResponse } from 'src/tracks/interfaces/track-response.interface';
import { IUserResponse } from 'src/users/interfaces/user-response.interface';

export interface IFpSearchResponse {
  author?: IUserResponse;
  foundTrack?: ITrackResponse;
  takenTime?: number;
  filename: string;
}
