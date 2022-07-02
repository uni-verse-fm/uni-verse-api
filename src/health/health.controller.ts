import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from './health.service';
@ApiTags('metrics')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  public async check(): Promise<HealthCheckResult> {
    return await this.healthService.check();
  }
}
