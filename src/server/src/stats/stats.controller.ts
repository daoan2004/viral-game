import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get statistics' })
  @ApiResponse({ status: 200, description: 'Return statistics' })
  async getStats(@Query('pageId') pageId?: string) {
    return this.statsService.getStats(pageId);
  }
}