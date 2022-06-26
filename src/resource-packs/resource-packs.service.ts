import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import {
  AccessType,
  CreateResourcePackDto,
} from './dto/create-resource-pack.dto';
import { UpdateResourcePackDto } from './dto/update-resource-pack.dto';
import {
  ResourcePack,
  ResourcePackDocument,
} from './schemas/resource-pack.schema';
import { ResourcesService } from '../resources/resources.service';
import { ICreateResourceResponse } from '../resources/interfaces/resource-create-response.interface';
import { IResourcePackResponse } from './interfaces/resource-pack-response.interface';
import { isValidId } from '../utils/is-valid-id';
import { buildSimpleFile } from '../utils/buildSimpleFile';
import { BucketName } from '../minio-client/minio-client.service';
import { FilesService } from '../files/files.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ResourcePacksService {
  private readonly logger: Logger = new Logger(ResourcePacksService.name);

  constructor(
    @InjectModel(ResourcePack.name)
    private resourcePackModel: Model<ResourcePackDocument>,
    private resourcesService: ResourcesService,
    @InjectConnection()
    private connection: Connection,
    private filesService: FilesService,
    private stripeService: PaymentsService,
  ) {}

  async createResourcePack(
    files: SimpleCreateFileDto[],
    previewFiles: SimpleCreateFileDto[],
    cover: SimpleCreateFileDto,
    createResourcePack: CreateResourcePackDto,
    author: UserDocument,
  ) {
    this.logger.log('Creating resource pack');
    await this.isResourcePackUnique(createResourcePack.title);
    await this.isValidAccount(author, createResourcePack.accessType);

    const orderedResources = this.orderedResources(files, createResourcePack);
    const previewFilesMap: Map<string, SimpleCreateFileDto> = new Map(
      previewFiles.map((previewFile) => [
        previewFile.originalFileName,
        previewFile,
      ]),
    );

    const session = await this.connection.startSession();

    let productId: string | undefined;
    try {
      let resourcePack;

      const createResponse = await session
        .withTransaction(async () => {
          const resources: ICreateResourceResponse[] =
            await this.resourcesService.createManyResources(
              createResourcePack.resources.map((resource) => ({
                ...resource,
                author,
                file: buildSimpleFile(
                  orderedResources,
                  resource.originalFileName,
                ),
                previewFile:
                  resource.previewFileName &&
                  buildSimpleFile(previewFilesMap, resource.previewFileName),
              })),
            );

          const coverName: string = await this.filesService.createFile(
            cover,
            BucketName.Images,
          );

          const price = await this.stripeService.createPrice(
            createResourcePack.title,
            author._id,
            createResourcePack.amount,
          );

          productId = price.product.toString();

          const createdResourcePack = {
            ...createResourcePack,
            author,
            resources: resources.map((resource) => resource._id),
            priceId: price.id,
            productId: price.product.toString(),
            coverName,
          };
          resourcePack = await this.resourcePackModel.create(
            createdResourcePack,
          );
        })
        .then(() => this.buildResourcePackInfo(resourcePack));
      return createResponse;
    } catch (error) {
      this.logger.error(`Can not create resource pack due to: ${error}`);
      productId && (await this.stripeService.disableProduct(productId));
    } finally {
      session.endSession();
    }
  }

  private orderedResources(
    files: SimpleCreateFileDto[],
    createResourcePack: CreateResourcePackDto,
  ): Map<string, SimpleCreateFileDto> {
    this.logger.log('ordering resources');

    const resourcePackFilesNames: string[] = createResourcePack.resources.map(
      (resource) => resource.originalFileName,
    );
    const filesFilesNames: string[] = files.map(
      (file) => file.originalFileName,
    );
    const fileNamesToFiles: Map<string, SimpleCreateFileDto> = new Map(
      files.map((file) => [file.originalFileName, file]),
    );

    const nameToFile: Map<string, SimpleCreateFileDto> = new Map<
      string,
      SimpleCreateFileDto
    >();

    if (resourcePackFilesNames.length === filesFilesNames.length) {
      resourcePackFilesNames.every((resourcePackFileName) => {
        if (filesFilesNames.includes(resourcePackFileName)) {
          nameToFile.set(
            resourcePackFileName,
            fileNamesToFiles.get(resourcePackFileName),
          );
          return true;
        }
        this.logger.error(
          `Resource pack file ${resourcePackFileName} not found`,
        );
        throw new BadRequestException(
          `File with resource name "${resourcePackFileName}" doesn't exist`,
        );
      });

      return nameToFile;
    }
    this.logger.error(`Resource pack files count doesn't match`);
    throw new BadRequestException(
      'The number of resources the number of files should be the same.',
    );
  }

  async findResourcePacks(
    title: string,
  ): Promise<ResourcePackDocument[] | ResourcePackDocument> {
    this.logger.log('Finding resource packs');
    if (title) return await this.findResourcePackByTitle(title);
    return await this.findAllResourcePacks();
  }

  async findAllResourcePacks(): Promise<ResourcePackDocument[]> {
    return await this.resourcePackModel.find();
  }

  async findResourcePackById(id: string): Promise<ResourcePackDocument> {
    this.logger.log('Finding resource pack by id');
    isValidId(id);
    const resourcePack = await this.resourcePackModel.findById(id);
    if (!resourcePack) {
      this.logger.error(`Resource pack with id ${id} not found`);
      throw new BadRequestException(`Resource pack with ID "${id}" not found.`);
    }
    return resourcePack;
  }

  async findResourcePackByTitle(title: string): Promise<ResourcePackDocument> {
    this.logger.log('Finding resource pack by title');
    const resourcePack = await this.resourcePackModel.findOne({ title });
    if (!resourcePack) {
      this.logger.error(`Resource pack with title ${title} not found`);
      throw new NotFoundException(
        `Resource pack with title ${title} not found.`,
      );
    }
    return resourcePack;
  }

  async updateResourcePack(
    id: string,
    _updateResourcePackDto: UpdateResourcePackDto,
    _owner: UserDocument,
  ) {
    this.logger.log('Updating resource pack');
    isValidId(id);
    return `This action updates a #${id} resource pack`;
  }

  async removeResourcePack(id: string, owner: UserDocument) {
    this.logger.log('Removing resource pack');
    isValidId(id);
    const resourcePack = await this.isUserTheOwnerOfResourcePack(id, owner);

    const session = await this.connection.startSession();

    try {
      const removeResponse = await session
        .withTransaction(async () => {
          await this.resourcesService.removeManyResources(
            resourcePack.resources,
            session,
          );
          await this.filesService.removeFile(
            resourcePack.coverName,
            BucketName.Images,
          );

          await resourcePack.remove();
        })
        .then(() => ({
          id: resourcePack._id.toString(),
          title: resourcePack.title,
          msg: 'ResourcePack deleted',
        }));
      return removeResponse;
    } catch (error) {
      this.logger.error(`Can not remove resource pack due to: ${error}`);
    } finally {
      session.endSession();
    }
  }

  private buildResourcePackInfo(
    resourcePack: ResourcePack,
  ): IResourcePackResponse {
    this.logger.log('Building resource pack info');
    return {
      title: resourcePack.title,
      description: resourcePack.description,
      coverName: resourcePack.coverName,
      author: {
        id: resourcePack.author._id.toString(),
        username: resourcePack.author.username,
        email: resourcePack.author.email,
        profilePicture: resourcePack.author.profilePicture,
      },
    };
  }

  private async isUserTheOwnerOfResourcePack(id: string, owner: UserDocument) {
    this.logger.log('Checking if user is the owner of resource pack');
    const resourcePack = await this.findResourcePackById(id);
    if (!resourcePack) {
      throw new NotFoundException('Somthing wrong with the server');
    }
    if (resourcePack.author._id.toString() !== owner._id.toString()) {
      throw new BadRequestException(
        'You are not the owner of this resource pack.',
      );
    }

    return resourcePack;
  }

  private async isResourcePackUnique(title: string) {
    this.logger.log('Checking if resource pack is unique');
    let resourcePack: ResourcePackDocument;
    try {
      resourcePack = await this.resourcePackModel.findOne({ title });
    } catch (error) {
      this.logger.error(
        `Can not check if resource pack is unique due to: ${error}`,
      );
      throw new Error('Somthing went wrong.');
    }
    if (resourcePack?.title === title) {
      this.logger.error(`Resource pack with title ${title} already exists`);
      throw new BadRequestException('Resource pack must be unique.');
    }
  }

  private async isValidAccount(user: User, accessType: AccessType) {
    this.logger.log('Checking if resource pack is unique');

    if(accessType === AccessType.Free) {
        return
    }
    
    if (!user.stripeAccountId) {
      throw new BadRequestException('Please do the payment onboarding first');
    }

    const accountInfo = await this.stripeService.findAccount(
      user.stripeAccountId,
    );
    if (!accountInfo.charges_enabled || !accountInfo.details_submitted)
      throw new BadRequestException(
        'Please finish your payment onboarding first',
      );
  }

  async resourcePacksByUserId(userId: any) {
    return await this.resourcePackModel.find({ owner: userId }).catch(() => {
      throw new Error('Somthing went wrong');
    });
  }
}
