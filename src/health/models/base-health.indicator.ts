/* Copyright (c) 2022 uni-verse corp */

import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import {
  PrometheusHistogram,
  PrometheusService,
} from '../../prometheus/prometheus.service';
import { Logger } from '@nestjs/common';
import { Gauge } from 'prom-client';

const TAG = 'HealthCheck';

export abstract class BaseHealthIndicator extends HealthIndicator {
  private readonly logger: Logger = new Logger(BaseHealthIndicator.name);

  public abstract name: string;
  public callMetrics: any;

  protected abstract help: string;
  protected abstract readonly promClientService: PrometheusService | undefined;
  protected readonly labelNames = ['status'];
  protected readonly buckets = [1];
  protected stateIsConnected = false;

  private metricsRegistered = false;
  private gaugesRegistered = false;
  private gauge: Gauge<string> | undefined;

  protected registerMetrics(): void {
    if (this.promClientService) {
      this.logger.log(
        'Register metrics histogram for: ' + this.name,
        TAG,
        true,
      );
      this.metricsRegistered = true;
      const histogram: PrometheusHistogram =
        this.promClientService.registerMetrics(
          this.name,
          this.help,
          this.labelNames,
          this.buckets,
        );
      this.callMetrics = histogram.startTimer();
    }
  }

  protected registerGauges(): void {
    if (this.promClientService) {
      this.logger.log('Register metrics gauge for: ' + this.name, TAG, true);
      this.gaugesRegistered = true;
      this.gauge = this.promClientService.registerGauge(this.name, this.help);
    }
  }

  protected isDefined(value: string | undefined): boolean {
    return !!value;
  }

  public updatePrometheusData(isConnected: boolean): void {
    if (this.stateIsConnected !== isConnected) {
      if (isConnected) {
        this.logger.log(this.name + ' is available', TAG, true);
      }

      this.stateIsConnected = isConnected;

      if (this.metricsRegistered) {
        this.callMetrics({ status: this.stateIsConnected ? 1 : 0 });
      }

      if (this.gaugesRegistered) {
        this.gauge?.set(this.stateIsConnected ? 1 : 0);
      }
    }
  }

  public abstract isHealthy(): Promise<HealthIndicatorResult>;

  public reportUnhealthy(): HealthIndicatorResult {
    this.updatePrometheusData(false);
    return this.getStatus(this.name, false);
  }

  public get customMetricsRegistered(): boolean {
    return this.metricsRegistered;
  }

  public get customGaugesRegistered(): boolean {
    return this.gaugesRegistered;
  }
}
