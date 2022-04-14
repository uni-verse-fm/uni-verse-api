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
import { FileMimeType, SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcePackFormDataParserInterceptor } from '../utils/interceptors/create-resource-pack.interceptor copy';
import { ApiMultiFileWithMetadata } from '../utils/swagger/multiple-file.decorator';

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
  @UseInterceptors(
    FilesInterceptor('files'),
    ResourcePackFormDataParserInterceptor,
  )
  create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CreateResourcePackWraperDto,
    @Request() request: IRequestWithUser,
  ) {
    const filesBuffers: SimpleCreateFileDto[] = files.map((file) => ({
      originalFileName: file.originalname,
      buffer: file.buffer,
      size: file.size,
      mimetype: FileMimeType[file.mimetype],
    }));

    return this.resourcePacksService.createResourcePack(
      filesBuffers,
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
  findOne(@Param('id') id: string) {
    return this.resourcePacksService.findResourcePackById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Update a resource pack' })
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
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.resourcePacksService.removeResourcePack(id, request.user);
  }
}
