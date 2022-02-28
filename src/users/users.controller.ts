import {
    Controller,
    Get,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from './interfaces/request-with-user.interface';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':username')
    findOneByUsername(@Param('username') username: string) {
        return this.usersService.findUserByUsername(username);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    remove(@Request() request: IRequestWithUser) {
        return this.usersService.remove(request.user.id);
    }
}
