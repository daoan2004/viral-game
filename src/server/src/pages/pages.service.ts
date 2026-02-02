import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findAll() {
    return this.tenantRepository.find();
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException('Page not found');
    }
    return { page: tenant };
  }

  async create(createPageDto: any) {
    const newTenant = this.tenantRepository.create({
      ...createPageDto,
      shop_name: createPageDto.shop_name || createPageDto.name, // Map frontend 'name' to entity 'shop_name'
      is_active: true,
      totalSpins: 0,
      totalPrizes: 0,
      totalUsers: 0,
    });
    return this.tenantRepository.save(newTenant);
  }

  async update(id: string, updatePageDto: any) {
    const existing = await this.tenantRepository.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('Page not found');
    }

    await this.tenantRepository.update(id, updatePageDto);
    return this.tenantRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const existing = await this.tenantRepository.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException('Page not found');
    }

    await this.tenantRepository.delete(id);
  }
}