/* Copyright (c) 2022 uni-verse corp */

import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { ValidIdInterceptor } from '../utils/interceptors/valid-id.interceptor';
import { CommentsService } from './comments.service';
import { CreateCommentDto, ModelType } from './dto/create-comment.dto';
import { HotCommentsDto } from './dto/hot-comments.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Comment a content' })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.commentsService.createComment(createCommentDto, request.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find all comments' })
  findAll() {
    return this.commentsService.findAllComments();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one comment by id' })
  @UseInterceptors(ValidIdInterceptor)
  findOne(@Param('id') id: string) {
    return this.commentsService.findCommentById(id);
  }

  @Get(':type/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Find one resource comments' })
  @UseInterceptors(ValidIdInterceptor)
  findResourceComments(
    @Param('id') contentId: string,
    @Param('type') typeOfContent: ModelType,
  ) {
    return this.commentsService.findResourceComments({
      contentId,
      typeOfContent,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Delete a comment' })
  @UseInterceptors(ValidIdInterceptor)
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.commentsService.removeComment(id, request.user);
  }

  @Get('/tracks/:limit/:startDate/:endDate')
  mostHot(@Param() params: HotCommentsDto) {
    return this.commentsService.hotTracksComments(params);
  }
}
