import {
  Body,
  Controller,
  Request,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { ReleaseFormDataParserInterceptor } from '../utils/interceptors/create-release.interceptor';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { ReleasesService } from './releases.service';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileMimeType,
  SimpleCreateFileDto,
} from '../files/dto/simple-create-file.dto';
import { ApiMultiFileWithMetadata } from '../utils/swagger/multiple-file.decorator';
import { CreateReleaseWraperDto } from './dto/create-release-wraper.dto';
import { CreateReleaseDto } from './dto/create-release.dto';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Publish a release' })
  @ApiConsumes('multipart/form-data')
  @ApiMultiFileWithMetadata()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'tracks', maxCount: 20 },
      { name: 'cover', maxCount: 1 },
    ]),
    ReleaseFormDataParserInterceptor,
  )
  async createRelease(
    @UploadedFiles()
    files: { tracks: Express.Multer.File[]; cover: Express.Multer.File[] },
    @Body() body: CreateReleaseWraperDto,
    @Request() request: IRequestWithUser,
  ) {
    const simpleCreateFiles: SimpleCreateFileDto[] = files.tracks.map(
      (file) => ({
        originalFileName: file.originalname,
        buffer: file.buffer,
        size: file.size,
        mimetype: FileMimeType[file.mimetype],
      }),
    );

    const coverFile = files.cover[0];
    const simpleCreateImage: SimpleCreateFileDto = {
      originalFileName: coverFile.originalname,
      buffer: coverFile.buffer,
      size: coverFile.size,
      mimetype: FileMimeType[coverFile.mimetype],
    };

    return this.releasesService.createRelease(
      simpleCreateFiles,
      simpleCreateImage,
      body.data,
      request.user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find all releases or one release by title' })
  @ApiQuery({ name: 'title', required: false })
  find(@Query('title') title: string) {
    return this.releasesService.find(title);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one release by id' })
  @UseInterceptors(ValidIdInterceptor)
  findOne(@Param('id') id: string) {
    return this.releasesService.findReleaseById(id);
  }

  @Post('/convert')
  @ApiOperation({ summary: 'Convert obejct to string' })
  @ApiCookieAuth('Set-Cookie')
  convertRelease(@Body() body: CreateReleaseDto) {
    return JSON.stringify(body).replace(/ /g, '');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Update a release' })
  @UseInterceptors(ValidIdInterceptor)
  updateRelease(
    @Param('id') id: string,
    @Body() updateReleaseDto: UpdateReleaseDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.releasesService.updateRelease(
      id,
      updateReleaseDto,
      request.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Delete a release' })
  @ApiCookieAuth('Set-Cookie')
  @UseInterceptors(ValidIdInterceptor)
  removeRelease(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.releasesService.removeRelease(id, request.user);
  }
}
