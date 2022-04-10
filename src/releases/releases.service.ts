import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { Release, ReleaseDocument } from './schemas/release.schema';
import { Model, Connection } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { IReleaseResponse } from './interfaces/release-response.interface';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { TracksService } from '../tracks/tracks.service';
import { UsersService } from '../users/users.service';
import { ITrackResponse } from '../tracks/interfaces/track-response.interface';

@Injectable()
export class ReleasesService {
    constructor(
        @InjectModel(Release.name)
        private releaseModel: Model<ReleaseDocument>,
        private tracksService: TracksService,
        private usersService: UsersService,
        @InjectConnection()
        private connection: Connection,
    ) { }

    async create(
        files: SimpleCreateFileDto[],
        createRelease: CreateReleaseDto,
        author: UserDocument,
    ) {
        await this.isReleaseUnique(createRelease.title);

        const feats: UserDocument[] =
            await this.usersService.findManyUsersByUsernames(
                createRelease.feats.map((feat) => feat.username),
            );

        const session = await this.connection.startSession();

        const orderedTracks = this.orderedTracks(files, createRelease);

        session.startTransaction();
        try {
            const tracks: ITrackResponse[] =
                await this.tracksService.createManyTracks(
                    createRelease.tracks.map((track) => ({
                        ...track,
                        author,
                        buffer: orderedTracks.get(track.trackFileName),
                    })),
                );
            const createdRelease = {
                ...createRelease,
                author,
                feats: feats.map((feat) => feat._id),
                tracks: tracks.map((track) => track._id),
            };
            const release = await this.releaseModel.create(createdRelease);

            await session.commitTransaction();

            return this.buildReleaseInfo(release, feats);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    private orderedTracks(
        files: SimpleCreateFileDto[],
        createRelease: CreateReleaseDto,
    ): Map<string, Buffer> {
        const releaseFilesNames: string[] = createRelease.tracks.map(
            (track) => track.trackFileName,
        );
        const filesFilesNames: string[] = files.map((file) => file.fileName);
        const fileNamesToFiles: Map<string, Buffer> = new Map(
            files.map((file) => [file.fileName, file.buffer]),
        );

        const nameToBuffer: Map<string, Buffer> = new Map<string, Buffer>();

        if (releaseFilesNames.length === filesFilesNames.length) {
            releaseFilesNames.every((releaseFileName) => {
                if (filesFilesNames.includes(releaseFileName)) {
                    nameToBuffer.set(
                        releaseFileName,
                        fileNamesToFiles.get(releaseFileName),
                    );
                    return true;
                }
                throw new BadRequestException(
                    `File with track name "${releaseFileName}" doesn't exist`,
                );
            });

            return nameToBuffer;
        }
        throw new BadRequestException(
            'The number of tracks the number of files should be the same.',
        );
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
            throw new BadRequestException(`Release with ID "${id}" not found.`);
        }
        return release;
    }

    async findByTitle(title: string): Promise<ReleaseDocument> {
        const release = await this.releaseModel.findOne({ title });
        if (!release) {
            throw new NotFoundException(`Release with title ${title} not found.`);
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
            id: release._id.toString(),
            title: release.title,
            msg: 'Release deleted',
        };
    }

    private buildReleaseInfo(
        release: Release,
        feats: UserDocument[],
    ): IReleaseResponse {
        return {
            title: release.title,
            description: release.description,
            coverUrl: release.coverUrl,
            feats: feats.map((feat) => ({
                id: feat._id.toString(),
                username: feat.username,
                email: feat.email,
            })),
            author: {
                id: release.author._id.toString(),
                username: release.author.username,
                email: release.author.email,
            },
        };
    }

    private async isReleaseUnique(title: string) {
        let release: ReleaseDocument;
        try {
            release = await this.releaseModel.findOne({ title });
        } catch (error) {
            throw new Error('Somthing went wrong.');
        }
        if (release?.title === title) {
            throw new BadRequestException('Release must be unique.');
        }
    }
}
