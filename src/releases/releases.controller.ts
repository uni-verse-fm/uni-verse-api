import { Body, Controller, Request, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFileDto } from '../files/dto/create-file.dto';
import { IRequestWithUser } from '../users/interfaces/request-with-user.interface';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { FormDataParserInterceptor } from '../utils/create-release.interceptor';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { ReleasesService } from './releases.service';
import 'multer';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';


interface CreateReleaseBody {
    data: CreateReleaseDto
}

@ApiTags('releases')
@Controller('releases')
export class ReleasesController {
    constructor(
        private readonly releasesService: ReleasesService,
        private readonly usersService: UsersService
    ) { }

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
    @UseInterceptors(FilesInterceptor('files'), FormDataParserInterceptor)
    async createRelease(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: CreateReleaseBody, @Request() request: IRequestWithUser) {
        console.log(files)
        var feats: User[] = [];
        if (body.data.feats)
            for (var feat of body.data.feats!) {
                feats.push(await this.usersService.findUserByUsername(feat.username))
            }
        const filesBuffers: CreateFileDto[] = files.map(file => ({ fileName: file.originalname, buffer: file.buffer }))
        return this.releasesService.create(filesBuffers, body.data, request.user, feats);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiOperation({ summary: 'Update a release' })
    updateRelease(@Param('id') id: string, @Body() updateReleaseDto: UpdateReleaseDto) {
        return this.releasesService.update(id, updateReleaseDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a release' })
    removeRelease(@Param('id') id: string) {
        return this.releasesService.remove(id);
    }
}
