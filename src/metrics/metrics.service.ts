/* Copyright (c) 2022 uni-verse corp */

import { Injectable } from '@nestjs/common';
import { HealthService } from '../health/health.service';
import { PrometheusService } from '../prometheus/prometheus.service';

@Injectable()
export class MetricsService {
  constructor(
    private promClientService: PrometheusService,
    private healthService: HealthService,
  ) {}

  public get metrics(): Promise<string> {
    this.healthService.check();
    return this.promClientService.metrics;
  }
}
