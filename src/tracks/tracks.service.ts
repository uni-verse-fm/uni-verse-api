import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { Track, TrackDocument } from './schemas/track.schema';
import { Model } from 'mongoose';
import { ITrackResponse } from './interfaces/track-response.interface';
import { FilesService } from '../files/files.service';
import IFileResponse from '../files/interfaces/file-response.interface';

@Injectable()
export class TracksService {

    constructor(
        @InjectModel(Track.name)
        private trackModel: Model<TrackDocument>,
        private filesService: FilesService,

    ) { }

    async create(createTrackDto: CreateTrackDto): Promise<TrackDocument> {
        this.isTrackUnique(createTrackDto.title);
        const file = {
            fileName: createTrackDto.trackFileName,
            buffer: createTrackDto.buffer
        }
        const result: IFileResponse = this.filesService.create(file)

        const createdTrack = {
            ...createTrackDto,
            trackFileUrl: result.trackFileUrl,
        }
        const track = await this.trackModel.create(createdTrack)

        return track;  
    }

    async findAll() {
        return await this.trackModel.find();
    }

    async findOne(id: string): Promise<TrackDocument> {
        const track = await this.trackModel.findById(id);
        if(!track) {
            throw new BadRequestException("This track doesn't exist");
        }
        return track;
    }

    async findByTitle(title: string): Promise<TrackDocument> {
        const track = await this.trackModel.findOne({ title });
        if(!track) {
            throw new BadRequestException("A track with this title doesn't exist");
        }
        return track;
    }

    update(id: string, updateTrackDto: UpdateTrackDto) {
        return `This action updates a #${id} track`;
    }

    async remove(id: string) {
        const track = await this.findOne(id);
        if (!track) {
            throw new NotFoundException('Somthing wrong with the server');
        }
        await this.trackModel.deleteOne({ id: track._id });
        return {
            id: track._id,
            title: track.title,
            msg: 'Track deleted',
        };
    }

    private buildTrackInfo(track: Track): ITrackResponse {
        return {
            title: track.title,
            trackFileUrl: track.trackFileUrl,
            feats: track.feats.map( feat => ({
                id: feat._id.toString(),
                username: feat.username,
                email: feat.email,
            })),
            author: {
                id: track.author._id.toString(),
                username: track.author.username,
                email: track.author.email,
            }
        }
    }

    private async isTrackUnique(title: string) {
        var release: TrackDocument;
        try {
            release = await this.trackModel.findOne({ title });
        } catch (error) {
            if (release?.title === title) {
                throw new BadRequestException('Title must be unique.');
            }
            throw new Error('Somthing went wrong.');
        }
        return release;
    }
}
