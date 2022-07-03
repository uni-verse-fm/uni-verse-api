/* Copyright (c) 2022 uni-verse corp */

import ICreateTrack from '../../tracks/interfaces/create-track.interface';
import ICreateUser from '../../users/interfaces/create-user.interface';

export default interface ICreateRelease {
  title: string;
  description: string;
  feats: ICreateUser[];
  tracks: ICreateTrack[];
}
