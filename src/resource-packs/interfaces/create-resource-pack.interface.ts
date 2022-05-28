import ICreateUser from '../../users/interfaces/create-user.interface';
import { AccessType } from '../dto/create-resource-pack.dto';

export default interface ICreateResourcePack {
  title: string;
  description: string;
  coverUrl: string;
  resources: ICreateResource[];
}

export interface ICreateResource {
  title: string;
  originalFileName: string;
  previewFileName: string;
  author: ICreateUser;
  accessType: AccessType;
  amount?: number;
}
