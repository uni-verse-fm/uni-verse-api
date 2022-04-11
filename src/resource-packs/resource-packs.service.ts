import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { UsersService } from '../users/users.service';
import { CreateResourcePackDto } from './dto/create-resource-pack.dto';
import { UpdateResourcePackDto } from './dto/update-resource-pack.dto';
import { ResourcePack, ResourcePackDocument } from './schemas/resource-pack.schema';
import { ResourcesService } from '../resources/resources.service';
import { IResourceResponse } from '../resources/interfaces/resource-response.interface';
import { IResourcePackResponse } from './interfaces/resource-pack-response.interface';

@Injectable()
export class ResourcePacksService {
    constructor(
        @InjectModel(ResourcePack.name)
        private resourcePackModel: Model<ResourcePackDocument>,
        private resourcesService: ResourcesService,
        private usersService: UsersService,
        @InjectConnection()
        private connection: Connection,
    ) { }

    async createResourcePack(
        files: SimpleCreateFileDto[],
        createResourcePack: CreateResourcePackDto,
        author: UserDocument,
    ) {
        await this.isResourcePackUnique(createResourcePack.title);

        const session = await this.connection.startSession();

        const orderedTracks = this.orderedResources(files, createResourcePack);

        session.startTransaction();
        try {
            const resources: IResourceResponse[] =
                await this.resourcesService.createManyResources(
                    createResourcePack.resources.map((resource) => ({
                        ...resource,
                        author,
                        buffer: orderedTracks.get(resource.resourceFileName),
                    })),
                );
            const createdResourcePack = {
                ...createResourcePack,
                author,
                resources: resources.map((resource) => resource._id),
            };
            const resourcePack = await this.resourcePackModel.create(createdResourcePack);

            await session.commitTransaction();

            return this.buildResourcePackInfo(resourcePack);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    private orderedResources(
        files: SimpleCreateFileDto[],
        createResourcePack: CreateResourcePackDto,
    ): Map<string, Buffer> {
        const resourcePackFilesNames: string[] = createResourcePack.resources.map(
            (resource) => resource.resourceFileName,
        );
        const filesFilesNames: string[] = files.map((file) => file.fileName);
        const fileNamesToFiles: Map<string, Buffer> = new Map(
            files.map((file) => [file.fileName, file.buffer]),
        );

        const nameToBuffer: Map<string, Buffer> = new Map<string, Buffer>();

        if (resourcePackFilesNames.length === filesFilesNames.length) {
            resourcePackFilesNames.every((resourcePackFileName) => {
                if (filesFilesNames.includes(resourcePackFileName)) {
                    nameToBuffer.set(
                        resourcePackFileName,
                        fileNamesToFiles.get(resourcePackFileName),
                    );
                    return true;
                }
                throw new BadRequestException(
                    `File with resource name "${resourcePackFileName}" doesn't exist`,
                );
            });

            return nameToBuffer;
        }
        throw new BadRequestException(
            'The number of resources the number of files should be the same.',
        );
    }

    async findResourcePacks(title: string): Promise<ResourcePackDocument[] | ResourcePackDocument> {
        if (title) return await this.findResourcePackByTitle(title);
        return await this.findAllResourcePacks();
    }

    async findAllResourcePacks(): Promise<ResourcePackDocument[]> {
        return await this.resourcePackModel.find();
    }

    async findResourcePackById(id: string): Promise<ResourcePackDocument> {
        const resourcePack = await this.resourcePackModel.findById(id);
        if (!resourcePack) {
            throw new BadRequestException(`Resource pack with ID "${id}" not found.`);
        }
        return resourcePack;
    }

    async findResourcePackByTitle(title: string): Promise<ResourcePackDocument> {
        const resourcePack = await this.resourcePackModel.findOne({ title });
        if (!resourcePack) {
            throw new NotFoundException(`Resource pack with title ${title} not found.`);
        }
        return resourcePack;
    }

    async updateResourcePack(id: string, updateResourcePackDto: UpdateResourcePackDto) {
        return `This action updates a #${id} resource pack`;
    }

    async removeResourcePack(id: string) {
        const resourcePack = await this.findResourcePackById(id);
        if (!resourcePack) {
            throw new NotFoundException('Somthing wrong with the server');
        }
        await this.resourcePackModel.deleteOne({ id: resourcePack._id });
        return {
            id: resourcePack._id.toString(),
            title: resourcePack.title,
            msg: 'ResourcePack deleted',
        };
    }

    private buildResourcePackInfo(
        resourcePack: ResourcePack,
    ): IResourcePackResponse {
        return {
            title: resourcePack.title,
            description: resourcePack.description,
            coverUrl: resourcePack.coverUrl,
            previewUrl: resourcePack.previewUrl,
            author: {
                id: resourcePack.author._id.toString(),
                username: resourcePack.author.username,
                email: resourcePack.author.email,
            },
        };
    }

    private async isResourcePackUnique(title: string) {
        let resourcePack: ResourcePackDocument;
        try {
            resourcePack = await this.resourcePackModel.findOne({ title });
        } catch (error) {
            throw new Error('Somthing went wrong.');
        }
        if (resourcePack?.title === title) {
            throw new BadRequestException('Resource pack must be unique.');
        }
    }
}
