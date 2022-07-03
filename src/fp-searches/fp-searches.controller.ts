/* Copyright (c) 2022 uni-verse corp */

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Logger } from 'mongodb';
import { SimpleCreateFileDto } from 'src/files/dto/simple-create-file.dto';
import { IRequestWithUser } from 'src/users/interfaces/request-with-user.interface';
import { ValidIdInterceptor } from 'src/utils/interceptors/valid-id.interceptor';
import { UpdateFpSearchDto } from './dto/update-fp-search.dto';
import { FpSearchesService } from './fp-searches.service';

@ApiTags('fp-searches')
@Controller('fp-searches')
export class FpSearchesController {
  constructor(private readonly fpSearchService: FpSearchesService) {}

  private readonly logger = new Logger(FpSearchesController.name);

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Initiate an FP search' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async initiateFpSearch(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() request?: IRequestWithUser,
  ) {
    const simpleCreateExtract: SimpleCreateFileDto = {
      originalFileName: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    };
    return this.fpSearchService.createFpSearch(
      simpleCreateExtract,
      request?.user,
    );
  }

  @Patch(':id')
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'INTERNAL: updates a fingerprint search.' })
  @UseInterceptors(ValidIdInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateFpSearchDto: UpdateFpSearchDto,
    // @Request() request: IRequestWithUser,
  ) {
    return this.fpSearchService.updateFpSearch(id, updateFpSearchDto);
  }
}
