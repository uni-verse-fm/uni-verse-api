import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ResourcePacksService } from './resource-packs.service';
import { UpdateResourcePackDto } from './dto/update-resource-pack.dto';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CreateResourcePackWraperDto } from './dto/create-resource-pack-wraper.dto';
import {
  FileMimeType,
  SimpleCreateFileDto,
} from '../files/dto/simple-create-file.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcePackFormDataParserInterceptor } from '../utils/interceptors/create-resource-pack.interceptor copy';
import { ApiMultiFileWithMetadata } from '../utils/swagger/multiple-file.decorator';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';

@ApiTags('resource-packs')
@Controller('resource-packs')
export class ResourcePacksController {
  constructor(private readonly resourcePacksService: ResourcePacksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Publish a resource pack' })
  @ApiConsumes('multipart/form-data')
  @ApiMultiFileWithMetadata()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'resources', maxCount: 20 },
    { name: 'cover', maxCount: 1 },
  ]), ResourcePackFormDataParserInterceptor)
  create(
    @UploadedFiles() files: { resources: Express.Multer.File[], cover: Express.Multer.File[] },
    @Body() body: CreateResourcePackWraperDto,
    @Request() request: IRequestWithUser,
  ) {
    const filesBuffers: SimpleCreateFileDto[] = files.resources.map((file) => ({
      originalFileName: file.originalname,
      buffer: file.buffer,
      size: file.size,
      mimetype: FileMimeType[file.mimetype],
    }));

    const coverFile = files.cover[0];
    const simpleCreateImage: SimpleCreateFileDto = {
        originalFileName: coverFile.originalname,
        buffer: coverFile.buffer,
        size: coverFile.size,
        mimetype: FileMimeType[coverFile.mimetype],
      };

    return this.resourcePacksService.createResourcePack(
      filesBuffers,
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one resource pack by id' })
  @UseInterceptors(ValidIdInterceptor)
  findOne(@Param('id') id: string) {
    return this.resourcePacksService.findResourcePackById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Update a resource pack' })
  @UseInterceptors(ValidIdInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateResourcePackDto: UpdateResourcePackDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.resourcePacksService.updateResourcePack(
      id,
      updateResourcePackDto,
      request.user,
    );
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
