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
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { UsersService } from '../users/users.service';
import { FormDataParserInterceptor } from '../utils/interceptors/create-release.interceptor';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { ReleasesService } from './releases.service';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SimpleCreateFileDto } from '../files/dto/simple-create-file.dto';
import { ApiMultiFileWithMetadata } from '../utils/swagger/multiple-file.decorator';
import { CreateReleaseWraperDto } from './dto/create-release-wraper.dto';
import { CreateReleaseDto } from './dto/create-release.dto';

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
  constructor(
    private readonly releasesService: ReleasesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Find all releases or one release by title' })
  @ApiQuery({ name: 'title', required: false })
  find(@Query('title') title: string) {
    return this.releasesService.find(title);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one release by id' })
  findOne(@Param('id') id: string) {
    return this.releasesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Publish a release' })
  @ApiConsumes('multipart/form-data')
  @ApiMultiFileWithMetadata()
  @ApiCookieAuth('Set-Cookie')
  @UseInterceptors(FilesInterceptor('files'), FormDataParserInterceptor)
  async createRelease(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CreateReleaseWraperDto,
    @Request() request: IRequestWithUser,
  ) {

    const filesBuffers: SimpleCreateFileDto[] = files.map((file) => ({
      fileName: file.originalname,
      buffer: file.buffer,
    }));

    return this.releasesService.create(
      filesBuffers,
      body.data,
      request.user,
    );
  }

  @Post('/convert')
  @ApiOperation({ summary: 'Convert obejct to string' })
  @ApiCookieAuth('Set-Cookie')
  convertRelease(@Body() body: CreateReleaseDto) {
    return JSON.stringify(body).replace(/ /g, "");
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a release' })
  updateRelease(
    @Param('id') id: string,
    @Body() updateReleaseDto: UpdateReleaseDto,
  ) {
    return this.releasesService.update(id, updateReleaseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a release' })
  @ApiCookieAuth('Set-Cookie')
  removeRelease(@Param('id') id: string) {
    return this.releasesService.remove(id);
  }
}
