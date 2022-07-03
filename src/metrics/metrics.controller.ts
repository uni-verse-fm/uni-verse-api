/* Copyright (c) 2022 uni-verse corp */

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  public metrics(): Promise<string> {
    return this.metricsService.metrics;
  }
}
