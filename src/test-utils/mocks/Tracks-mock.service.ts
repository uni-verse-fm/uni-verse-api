import { Track } from "../../tracks/schemas/track.schema";
import { data2list } from "./standard-mock.service";

export interface TrackInformation {
    trackFileUrl: string;
    title: string;
    trackFileName: string;
    buffer: Buffer;
}

export default class TracksRepoMockModel {

    tracks: Track[];

    constructor(private data: Object){
        this.tracks = data2list(data);
    }

    find = () => this.tracks;
    findOne = (trackTitle: TrackInformation) => this.tracks.filter(track => track.title === trackTitle.title);
    findById = (id: string) => this.tracks.filter(track => track._id.toString() === id);
    deleteOne = (trackTitle: TrackInformation) => this.tracks.filter(track => track.title === trackTitle.title);
    create = (trackTitle: TrackInformation) => this.tracks.filter(track => track.title === trackTitle.title);
    save = () => Promise.resolve();
};