import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ResourcePacksService } from './resource-packs.service';
import { UpdateResourcePackDto } from './dto/update-resource-pack.dto';
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CreateResourcePackWraperDto } from './dto/create-resource-pack-wraper.dto';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
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
  @ApiOperation({ summary: 'Publish a release' })
  @ApiConsumes('multipart/form-data')
  @ApiMultiFileWithMetadata()
  @UseInterceptors(FilesInterceptor('files'), ResourcePackFormDataParserInterceptor)
  create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CreateResourcePackWraperDto,
    @Request() request: IRequestWithUser
  ) {
    const filesBuffers: SimpleCreateFileDto[] = files.map((file) => ({
        fileName: file.originalname,
        buffer: file.buffer,
      }));
      
    return this.resourcePacksService.createResourcePack(
        filesBuffers,
        body.data,
        request.user
    );
  }

  @Get()
  findAll() {
    return this.resourcePacksService.findAllResourcePacks();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcePacksService.findResourcePackById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResourcePackDto: UpdateResourcePackDto) {
    return this.resourcePacksService.updateResourcePack(id, updateResourcePackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcePacksService.removeResourcePack(id);
  }
}
