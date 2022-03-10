import {
    Controller,
    Get,
    Param,
    Delete,
    UseGuards,
    Request,
    Patch,
    Body,
    Post,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from './interfaces/request-with-user.interface';
import { UpdateReleaseDto } from '../releases/dto/update-release.dto';
import { ReleasesService } from '../releases/releases.service';
import { CreateReleaseDto } from '../releases/dto/create-release.dto';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly releasesService: ReleasesService,
    ) { }

    @Get()
    find(@Query('username') username: string) {
        return this.usersService.find(username);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':username')
    findOneByUsername(@Param('username') username: string) {
        return this.usersService.findUserByUsername(username);
    }

    @Get(':id')
    findOneById(@Param('id') id: string) {
        return this.usersService.findUserById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    remove(@Request() request: IRequestWithUser) {
        return this.usersService.remove(request.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/me/release')
    create(@Body() release: CreateReleaseDto, @Request() request: IRequestWithUser) {
        return this.releasesService.create(release, request.user);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/me/release/:id')
    update(@Param('id') id: string, @Body() updateReleaseDto: UpdateReleaseDto) {
        return this.releasesService.update(id, updateReleaseDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/me/release/:id')
    removeRelease(@Param('id') id: string) {
        return this.releasesService.remove(id);
    }
}
