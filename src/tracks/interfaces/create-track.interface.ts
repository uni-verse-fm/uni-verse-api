import ICreateUser from '../../users/interfaces/create-user.interface';

export default interface ICreateTrack {
  title: string;
  trackFileName: string;
  author: ICreateUser;
  feats: ICreateUser[];
}
