import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
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
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @UseInterceptors(ValidIdInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.commentsService.updateComment(
      id,
      updateCommentDto,
      request.user,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Set-Cookie')
  @ApiOperation({ summary: 'Delete a comment' })
  @UseInterceptors(ValidIdInterceptor)
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.commentsService.removeComment(id, request.user);
  }
}
