import * as mongoose from 'mongoose';
import { Track } from '../../tracks/schemas/track.schema';
import * as data from '../data/mock_data.json';
import { data2list } from './standard-mock.service';


export default class SpecificRepoMockModel {
    static tracks: Track[] = data2list(data.tracks);
    static index: number = 0;

    constructor(private track) {}

    static find = jest.fn().mockResolvedValue(this.tracks);
    static findOne = jest.fn().mockResolvedValue(this.tracks[this.index]);
    static findById = jest.fn().mockResolvedValue(this.tracks[this.index]);
    static deleteOne = jest.fn().mockResolvedValue(this.tracks[this.index]);
    static create = jest.fn().mockResolvedValue(this.tracks[this.index + 1]);
    save = jest.fn().mockResolvedValue({...this.track, _id: SpecificRepoMockModel.tracks.filter((track) => track.title === this.track.title)[0]._id});
}