import ICreateTrack from '../../tracks/interfaces/create-track.interface';

export default interface ICreateResourcePack {
  title: string;
  description: string;
  coverUrl: string;
  resources: ICreateTrack[];
}
