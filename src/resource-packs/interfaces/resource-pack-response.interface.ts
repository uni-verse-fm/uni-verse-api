import { IUserResponse } from '../../users/interfaces/user-response.interface';

export interface IResourcePackResponse {
  title: string;
  description: string;
  coverName: string;
  previewUrl: string;
  author: IUserResponse;
}
