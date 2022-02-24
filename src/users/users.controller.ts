import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { User as CurrentUser } from '../auth/decorators/user.decorator';
import { CurrentUserRequest } from './interfaces/current-user-request.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    @Public()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Post('login')
    @Public()
    login(@Body() loginUserDto: LoginUserDto) {
        return this.usersService.login(loginUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':username')
    findOneByUsername(@Param('username') username: string) {
        return this.usersService.findUserByUsername(username);
    }

    @Get('user')
    findOneByEmail(@Query('email') email: string) {
        return this.usersService.findUserByEmail(email);
    }

    @Delete()
    remove(@CurrentUser() request: CurrentUserRequest) {
        return this.usersService.remove(request.userId);
    }
}
