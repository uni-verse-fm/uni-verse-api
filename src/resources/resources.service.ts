import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilesService } from '../files/files.service';
import { Model, ClientSession } from 'mongoose';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import IFileResponse from '../files/interfaces/file-response.interface';
import { IResourceResponse } from './interfaces/resource-response.interface';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name)
    private resourceModel: Model<ResourceDocument>,
    private filesService: FilesService,
  ) {}

  async createResource(
    createResourceDto: CreateResourceDto,
    session: ClientSession | null = null,
  ): Promise<IResourceResponse> {
    this.isResourceUnique(createResourceDto.title);

    const file = {
      fileName: createResourceDto.resourceFileName,
      buffer: createResourceDto.buffer,
    };
    const result: IFileResponse = this.filesService.create(file);

    const createResource = {
      ...createResourceDto,
      resourceFileUrl: result.fileUrl,
    };

    const newResource = new this.resourceModel(createResource);

    const createdResource = await newResource.save({ session });

    return this.buildResourceInfo(createdResource);
  }

  async createManyResources(
    resources: CreateResourceDto[],
    session: ClientSession | null = null,
  ): Promise<IResourceResponse[]> {
    return await Promise.all(
      resources.map((resource) => this.createResource(resource, session)),
    );
  }

  async findAllResources() {
    return await this.resourceModel.find();
  }

  async findResourceById(id: string): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findById(id);
    if (!resource) {
      throw new BadRequestException(`Resource with ID "${id}" doesn't exist`);
    }
    return resource;
  }

  async findResourceByTitle(title: string): Promise<ResourceDocument> {
    const resource = await this.resourceModel.findOne({ title });
    if (!resource) {
      throw new BadRequestException(
        `Resource with title "${title}" doesn't exist`,
      );
    }
    return resource;
  }

  updateResource(id: string, updateResourceDto: UpdateResourceDto) {
    return `This action updates a #${id} resource`;
  }

  async removeResource(id: string) {
    const resource = await this.findResourceById(id);
    if (!resource) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.resourceModel.deleteOne({ id: resource._id });
    return {
      id: resource._id,
      title: resource.title,
      msg: 'Resource deleted',
    };
  }

  // for testing
  private buildResourceInfo(resource: any): IResourceResponse {
    return {
      _id: resource._id,
      title: resource.title,
      resourceFileUrl: resource.resourceFileUrl,
      author: resource.author,
    };
  }

  private async isResourceUnique(title: string) {
    const resource = await this.resourceModel.findOne({ title });
    if (resource?.title === title) {
      throw new BadRequestException('Title must be unique.');
    }
  }
}
