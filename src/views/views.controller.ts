import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { ViewsService } from './views.service';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { PeriodViewsDto } from './dto/period-views.dto';
import { CreateViewDto } from './dto/create-view.dto';
import { HotViewsDto } from './dto/hots-views.dto';

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
  countViewsByTrackId(@Param('id') id: string) {
    return this.viewsService.countViewsByTrackId(id);
  }

  @Get('tracks/:limit/:startDate/:endDate')
  hotTracks(@Param() params: HotViewsDto) {
    return this.viewsService.hotTracks(params);
  }

  @Get('releases/:limit/:startDate/:endDate')
  hotReleases(@Param() params: HotViewsDto) {
    return this.viewsService.hotReleases(params);
  }

  @Get(':id/:startDate/:endDate')
  @UseGuards(JwtAuthGuard)
  countViewsByDate(@Param() params: PeriodViewsDto) {
    return this.viewsService.periodCountViewsByTrackId(params);
  }
}
