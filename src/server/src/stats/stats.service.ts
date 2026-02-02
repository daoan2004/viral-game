import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../pages/tenant.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async getStats(pageId?: string) {
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');

    if (pageId) {
      queryBuilder.where('tenant.id = :pageId', { pageId });
    }

    const { totalSpins, totalPrizes, totalUsers } = await queryBuilder
      .select('SUM(tenant.totalSpins)', 'totalSpins')
      .addSelect('SUM(tenant.totalPrizes)', 'totalPrizes')
      .addSelect('SUM(tenant.totalUsers)', 'totalUsers')
      .getRawOne();
    
    // If pageId is provided, we count it as 1 page, else count all
    const totalPages = pageId ? (totalSpins ? 1 : 0) : await this.tenantRepository.count();

    return {
      totalPages,
      totalSpins: Number(totalSpins) || 0,
      totalPrizes: Number(totalPrizes) || 0,
      totalUsers: Number(totalUsers) || 0,
    };
  }
}