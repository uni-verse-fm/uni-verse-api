import ICreateTrack from "../../tracks/interfaces/create-track.interface";
import ICreateUser from "../../users/interfaces/create-user.interface";

export default interface ICreateRelease {
    title: string;
    description: string;
    coverFileName: string;
    feats?: ICreateUser[];
    tracks: ICreateTrack[];
}