import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PagesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll() {
    const tenants = await this.firebaseService.getTenants();
    return tenants.map((tenant: any) => ({
      id: tenant.id,
      shop_name: (tenant as any).shop_name || (tenant as any).name || 'Unknown Page',
      is_active: (tenant as any).is_active ?? true,
      totalSpins: (tenant as any).totalSpins || 0,
      totalPrizes: (tenant as any).totalPrizes || 0,
      totalUsers: (tenant as any).totalUsers || 0,
      created_at: (tenant as any).created_at,
      updated_at: (tenant as any).updated_at,
    }));
  }

  async findOne(id: string) {
    const tenant = await this.firebaseService.getTenant(id);
    if (!tenant) {
      throw new Error('Page not found');
    }
    return { page: tenant };
  }

  async create(createPageDto: any) {
    const pageData = {
      ...createPageDto,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      totalSpins: 0,
      totalPrizes: 0,
      totalUsers: 0,
    };

    return this.firebaseService.createTenant(pageData);
  }

  async update(id: string, updatePageDto: any) {
    // Check if page exists first
    const existing = await this.firebaseService.getTenant(id);
    if (!existing) {
      throw new Error('Page not found');
    }

    const updateData = {
      ...updatePageDto,
      updated_at: new Date().toISOString(),
    };

    return this.firebaseService.updateTenant(id, updateData);
  }

  async remove(id: string) {
    // Check if page exists first
    const existing = await this.firebaseService.getTenant(id);
    if (!existing) {
      throw new Error('Page not found');
    }

    return this.firebaseService.deleteTenant(id);
  }
}