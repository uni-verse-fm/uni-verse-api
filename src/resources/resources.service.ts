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
import { ICreateResourceResponse } from './interfaces/resource-create-response.interface';
import { IDeleteResourceResponse } from './interfaces/resource-delete-response.interface copy';
import { BucketName } from '../minio-client/minio-client.service';

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
  ): Promise<ICreateResourceResponse> {
    // this.isResourceUnique(createResourceDto.title);

    const result: string = await this.filesService.createFile(createResourceDto.file, BucketName.Resources);

    const createResource = {
      ...createResourceDto,
      fileName: result,
    };

    const newResource = new this.resourceModel(createResource);

    const createdResource = await newResource.save({ session });

    return this.buildResourceInfo(createdResource);
  }

  async createManyResources(
    resources: CreateResourceDto[],
    session: ClientSession | null = null,
  ): Promise<ICreateResourceResponse[]> {
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

  async removeResource(id: string, session: ClientSession | null = null) {
    const resource = await this.findResourceById(id);
    if (!resource) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    await this.resourceModel.deleteOne({ id: resource._id }, session);
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
    return await Promise.all(
      resources.map((resource) =>
        this.removeResource(resource.toString(), session),
      ),
    );
  }

  // for testing
  private buildResourceInfo(resource: any): ICreateResourceResponse {
    return {
      _id: resource._id,
      title: resource.title,
      fileName: resource.fileName,
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
