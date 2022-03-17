import { Test, TestingModule } from '@nestjs/testing';
import { TracksService } from './tracks.service';
import * as data from '../test-utils/data/mock_data.json'
import RepoMockModel, { data2list } from '../test-utils/mocks/standard-mock.service';
import { getModelToken } from '@nestjs/mongoose';
import { Track } from './schemas/track.schema';
import { User } from '../users/schemas/user.schema';
import * as mongoose from 'mongoose';
import { FilesService } from '../files/files.service';

const track = data.tracks.change_clothes;
const track1 = data.tracks.encore;
const create_track = data.create_tracks.encore;


const tracks = data2list(data.tracks)

const author = data.users.jayz
describe('TracksService', () => {
    let tracksService: TracksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TracksService,
                FilesService,
                {
                    provide: getModelToken(Track.name),
                    useValue: new RepoMockModel(data.tracks),
                },
            ],
        }).compile();

        tracksService = module.get<TracksService>(TracksService);
    });

    describe('When create one track', () => {
        const authorParam: User = {
            ...author,
            _id: new mongoose.Schema.Types.ObjectId(author._id),
            releases: []
        }

        const feats = track1.feats.map(feat => ({
            ...feat,
            _id: new mongoose.Schema.Types.ObjectId(feat._id),
            releases: []
        }))

        const body = {
            ...create_track,
            buffer: Buffer.from(JSON.parse(JSON.stringify(create_track.buffer))),
            author: authorParam,
            feats
        };

        const expected = {
            _id: track1._id,
            title: track1.title,
            trackFileUrl: track1.trackFileUrl,
            author: author,
            feats: track1.feats
        };
        it('should return one track infos', async () => {
            const result = await tracksService.create(body)
            console.log(JSON.stringify(result))
            expect(result).toStrictEqual(expected);
        });
    })

    describe('When find all tracks', () => {
        it('should return a list of tracks', async () => {
            const result = await tracksService.findAll()
            expect(result).toStrictEqual(tracks);
        });
    })

    describe('When find one track by id', () => {
        it('should return one track', async () => {
            const result = await tracksService.findOne(track._id)
            expect(result).toStrictEqual(track);
        });
    })

    describe('When find one track by title', () => {
        it('should return one track', async () => {
            const result = await tracksService.findByTitle(track.title)
            expect(result).toStrictEqual(track);
        });
    })

    describe('When remove one track', () => {

        const expected = {
            id: track._id,
            title: track.title,
            msg: 'Track deleted',
        };
        it('should return one track infos', async () => {
            const result = await tracksService.remove(track._id)
            expect(result).toStrictEqual(expected);
        });
    })
});
