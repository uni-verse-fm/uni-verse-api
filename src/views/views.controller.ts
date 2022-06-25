import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Controller, Get, Patch, Param, UseGuards, Post, Body } from '@nestjs/common';
import { ViewsService } from './views.service';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { PeriodViewsDto } from './dto/period-views.dto';
import { CreateViewDto } from './dto/create-view.dto';

@Controller('views')
@ApiExcludeController()
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Post()
  @UseGuards(AdminJwtAuthGuard)
  addView(@Body() view: CreateViewDto) {
    return this.viewsService.createView(view);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findMyViews(@Param('id') id: string) {
    return this.viewsService.findViewsByUserId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  countViewsByTrackId(@Param('id') id: string) {
    return this.viewsService.countViewsByTrackId(id);
  }

  @Patch(':id/:startDate/:endDate')
  @UseGuards(JwtAuthGuard)
  findViewByDate(@Param() params: PeriodViewsDto) {
    return this.viewsService.periodCountViewsByTrackId(params);
  }
}
