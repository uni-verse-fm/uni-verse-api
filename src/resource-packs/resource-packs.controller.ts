import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Logger,
  Query,
} from '@nestjs/common';
import { ResourcePacksService } from './resource-packs.service';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CreateResourcePackWraperDto } from './dto/create-resource-pack-wraper.dto';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcePackFormDataParserInterceptor } from '../utils/interceptors/create-resource-pack.interceptor copy';
import { ApiMultiFileWithMetadata } from '../utils/swagger/multiple-file.decorator';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';

@ApiTags('resource-packs')
@Controller('resource-packs')
export class ResourcePacksController {
  constructor(private readonly resourcePacksService: ResourcePacksService) {}

  private readonly logger: Logger = new Logger(ResourcePacksController.name);

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Publish a resource pack' })
  @ApiConsumes('multipart/form-data')
  @ApiMultiFileWithMetadata()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'resources', maxCount: 20 },
      { name: 'cover', maxCount: 1 },
      { name: 'previews', maxCount: 20 },
    ]),
    ResourcePackFormDataParserInterceptor,
  )
  createResourcePack(
    @UploadedFiles()
    files: {
      resources: Express.Multer.File[];
      cover: Express.Multer.File[];
      previews: Express.Multer.File[];
    },
    @Body() body: CreateResourcePackWraperDto,
    @Request() request: IRequestWithUser,
  ) {
    const filesBuffers: SimpleCreateFileDto[] = files.resources.map((file) => ({
      originalFileName: file.originalname,
      buffer: file.buffer,
      size: file.size,
      mimetype: file.mimetype,
    }));

    const previews = files.previews ? files.previews : [];
    const previewFilesBuffers: SimpleCreateFileDto[] = previews.map((file) => ({
      originalFileName: file.originalname,
      buffer: file.buffer,
      size: file.size,
      mimetype: file.mimetype,
    }));

    const simpleCreateImage: SimpleCreateFileDto | undefined = files.cover
      ? {
          originalFileName: files.cover[0].originalname,
          buffer: files.cover[0].buffer,
          size: files.cover[0].size,
          mimetype: files.cover[0].mimetype,
        }
      : undefined;

    return this.resourcePacksService.createResourcePack(
      filesBuffers,
      previewFilesBuffers,
      simpleCreateImage,
      body.data,
      request.user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({
    summary: 'Find all resource packs or one resource pack by title',
  })
  @ApiQuery({ name: 'title', required: false })
  findAll() {
    return this.resourcePacksService.findAllResourcePacks();
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find resource packs' })
  userResourcePacks(@Param('id') id: string) {
    return this.resourcePacksService.resourcePacksByUserId(id);
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find resource packs' })
  async downloadResource(
    @Param('id') packId: string,
    @Query('resource') resourceId: string,
    @Query('destId') destId: string,
    @Request() request: IRequestWithUser,
  ) {
    return await this.resourcePacksService.downloadResource(
      request.user.id,
      packId,
      resourceId,
      destId,
    );
  }

  @Get('search')
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Search resource-packs' })
  searchResourcePacks(@Query('search') search: string) {
    if (search) return this.resourcePacksService.searchPacks(search);
    return [];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one resource pack by id' })
  @UseInterceptors(ValidIdInterceptor)
  findOne(@Param('id') id: string) {
    return this.resourcePacksService.findResourcePackById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Delete a resource pack' })
  @ApiCookieAuth('Set-Cookie')
  @UseInterceptors(ValidIdInterceptor)
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.resourcePacksService.removeResourcePack(id, request.user);
  }
}
