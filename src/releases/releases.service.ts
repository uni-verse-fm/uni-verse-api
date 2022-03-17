import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { Release, ReleaseDocument } from './schemas/release.schema';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { IReleaseResponse } from './interfaces/release-response.interface';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { TracksService } from '../tracks/tracks.service';
import { TrackDocument } from '../tracks/schemas/track.schema';

@Injectable()
export class ReleasesService {

    constructor(
        @InjectModel(Release.name)
        private releaseModel: Model<ReleaseDocument>,
        private tracksService: TracksService,
    ) { }

    async create(files: SimpleCreateFileDto[], createRelease: CreateReleaseDto, author: User, feats: User[]) {

        await this.isReleaseUnique(createRelease.title);

        const orderedTracks = this.orderedTracks(files, createRelease);

        const tracks: Promise<TrackDocument>[] = createRelease.tracks.map(async (track) => {
            const createTrack = {
                ...track,
                author,
                feats,
                buffer: orderedTracks.get(track.trackFileName)
            };
            return await this.tracksService.create(createTrack);
        })

        const createdRelease = {
            ...createRelease,
            author,
            feats,
            tracks
        }
        const release = await this.releaseModel.create(createdRelease)

        return this.buildReleaseInfo(release);
    }

    private orderedTracks(files: SimpleCreateFileDto[], createRelease: CreateReleaseDto): Map<string, Buffer> {
        const releaseFilesNames: string[] = createRelease.tracks.map(track => track.trackFileName)
        const filesFilesNames: string[] = files.map(file => file.fileName)
        const fileNamesToFiles: Map<String, Buffer> = new Map(files.map(file => [file.fileName, file.buffer]));

        var nameToBuffer: Map<string, Buffer> = new Map<string, Buffer>();

        if (releaseFilesNames.length === filesFilesNames.length) {
            releaseFilesNames.every(releaseFileName => {
                if (filesFilesNames.includes(releaseFileName)) {
                    nameToBuffer.set(releaseFileName, fileNamesToFiles.get(releaseFileName))
                    return true;
                }
                throw new BadRequestException(`File with track name "${releaseFileName}" doesn't exist`);
            });

            return nameToBuffer;
        }
        throw new BadRequestException("The number of tracks the number of files should be the same.");
    }

    async find(title: string): Promise<ReleaseDocument[] | ReleaseDocument> {
        if (title) return await this.findByTitle(title);
        return await this.findAll();
    }

    async findAll(): Promise<ReleaseDocument[]> {
        return await this.releaseModel.find();
    }

    async findOne(id: string): Promise<ReleaseDocument> {
        const release = await this.releaseModel.findById(id);
        if (!release) {
            throw new BadRequestException("This release doesn't exist");
        }
        return release;
    }

    async findByTitle(title: string): Promise<ReleaseDocument> {
        const release = await this.releaseModel.findOne({ title });
        if (!release) {
            throw new BadRequestException("A release with this title doesn't exist");
        }
        return release;
    }

    async update(id: string, updateReleaseDto: UpdateReleaseDto) {
        return `This action updates a #${id} release`;
    }

    async remove(id: string) {
        const release = await this.findOne(id);
        if (!release) {
            throw new NotFoundException('Somthing wrong with the server');
        }
        await this.releaseModel.deleteOne({ id: release._id });
        return {
            id: release._id,
            title: release.title,
            msg: 'Release deleted',
        };
    }

    private buildReleaseInfo(release: Release): IReleaseResponse {
        return {
            title: release.title,
            description: release.description,
            coverUrl: release.coverUrl,
            feats: release.feats.map(feat => ({
                id: feat._id.toString(),
                username: feat.username,
                email: feat.email,
            })),
            author: {
                id: release.author._id.toString(),
                username: release.author.username,
                email: release.author.email,
            }
        }
    }

    private async isReleaseUnique(title: string) {
        const release = await this.releaseModel.findOne({ title });
        if (release?.title === title) {
            throw new BadRequestException('Title must be unique.');
        }
    }
}
