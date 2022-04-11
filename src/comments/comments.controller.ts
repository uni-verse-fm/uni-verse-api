import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.commentsService.createComment(createCommentDto, request.user);
  }

  @Get()
  findAll() {
    return this.commentsService.findAllComments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findCommentById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() request: IRequestWithUser,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, request.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() request: IRequestWithUser) {
    return this.commentsService.removeComment(id, request.user);
  }
}
