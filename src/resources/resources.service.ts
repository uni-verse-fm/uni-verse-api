import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilesService } from '../files/files.service';
import { Model, ClientSession } from 'mongoose';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { ICreateResourceResponse } from './interfaces/resource-create-response.interface';
import { IDeleteResourceResponse } from './interfaces/resource-delete-response.interface copy';
import { BucketName } from '../minio-client/minio-client.service';
import { isValidId } from '../utils/is-valid-id';

@Injectable()
export class ResourcesService {
  private readonly logger: Logger = new Logger(ResourcesService.name);

  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<ResourceDocument>,
    private filesService: FilesService,
  ) {}

  async createResource(
    createResourceDto: CreateResourceDto,
    session: ClientSession | null = null,
  ): Promise<ICreateResourceResponse> {
    this.logger.log(`Creating resource ${createResourceDto.title}`);
    const fileName: string = await this.filesService.createFile(
      createResourceDto.file,
      BucketName.Resources,
    );

    const previewFileName: string = createResourceDto.previewFile
      ? await this.filesService.createFile(
          createResourceDto.previewFile,
          BucketName.Previews,
        )
      : null;

    const createResource = {
      ...createResourceDto,
      fileName,
      previewFileName,
    };

    const newResource = new this.resourceModel(createResource);

    const createdResource = await newResource.save({ session });

    return this.buildResourceInfo(createdResource);
  }

  async createManyResources(
    resources: CreateResourceDto[],
    session: ClientSession | null = null,
  ): Promise<ICreateResourceResponse[]> {
    this.logger.log(`Creating ${resources.length} resources`);
    return await Promise.all(
      resources.map((resource) => this.createResource(resource, session)),
    );
  }

  async findAllResources() {
    this.logger.log('Finding all resources');
    return await this.resourceModel.find();
  }

  async findResourceById(id: string): Promise<ResourceDocument> {
    this.logger.log(`Finding resource ${id}`);
    isValidId(id);
    const resource = await this.resourceModel.findById(id);
    if (!resource) {
      this.logger.error(`Resource ${id} not found`);
      throw new BadRequestException(`Resource with ID "${id}" doesn't exist`);
    }
    return resource;
  }

  async findResourceByTitle(title: string): Promise<ResourceDocument> {
    this.logger.log(`Finding resource ${title}`);
    const resource = await this.resourceModel.findOne({ title });
    if (!resource) {
      this.logger.error(`Resource ${title} not found`);
      throw new BadRequestException(
        `Resource with title "${title}" doesn't exist`,
      );
    }
    return resource;
  }

  updateResource(id: string, _updateResourceDto: UpdateResourceDto) {
    this.logger.log(`Updating resource ${id}`);
    return `This action updates a #${id} resource`;
  }

  async removeResource(id: string, session: ClientSession | null = null) {
    this.logger.log(`Removing resource ${id}`);
    const resource = await this.findResourceById(id);
    if (!resource) {
      this.logger.error(`Resource ${id} not found`);
      throw new NotFoundException('Somthing wrong with the server');
    }
    await resource.remove(session);
    await this.filesService.removeFile(resource.fileName, BucketName.Resources);
    return {
      id: resource._id,
      title: resource.title,
      msg: 'Resource deleted',
    };
  }

  async removeManyResources(
    resources: Resource[],
    session: ClientSession | null = null,
  ): Promise<IDeleteResourceResponse[]> {
    this.logger.log(`Removing ${resources.length} resources`);
    return await Promise.all(
      resources.map((resource) =>
        this.removeResource(resource.toString(), session),
      ),
    );
  }

  private buildResourceInfo(resource: any): ICreateResourceResponse {
    this.logger.log(`Building resource info ${resource.title}`);
    return {
      _id: resource._id,
      title: resource.title,
      fileName: resource.fileName,
      author: resource.author,
    };
  }

  private async isResourceUnique(title: string) {
    this.logger.log(`Checking if resource ${title} is unique`);
    const resource = await this.resourceModel.findOne({ title });
    if (resource?.title === title) {
      throw new BadRequestException('Title must be unique.');
    }
  }
}
