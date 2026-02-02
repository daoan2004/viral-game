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
      shop_name: createPageDto.shop_name || createPageDto.name || `Page ${createPageDto.id || 'Unknown'}`, // Fallback to avoid Not Null error
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
      // If not exists, create it (Upsert logic)
      return this.create({
        id,
        ...updatePageDto
      });
    }

    // Separate valid entity fields from config data
    const { shop_name, access_token, is_active, ...configData } = updatePageDto;
    
    const updateData: any = {};
    if (shop_name !== undefined) updateData.shop_name = shop_name;
    if (access_token !== undefined) updateData.access_token = access_token;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Store everything else in config JSON field
    if (Object.keys(configData).length > 0) {
      updateData.config = {
        ...(existing.config || {}),
        ...configData
      };
    }

    await this.tenantRepository.update(id, updateData);
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