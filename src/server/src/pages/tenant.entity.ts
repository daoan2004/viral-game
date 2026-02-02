import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Tenant {
  @PrimaryColumn()
  id: string; // Facebook Page ID

  @Column()
  shop_name: string;

  @Column({ nullable: true })
  access_token: string;

  @Column({ default: true })
  is_active: boolean;

  // Configuration (prizes, messages, shop_patterns)
  @Column('simple-json', { nullable: true })
  config: any;

  // Stats (simplified for SQLite)
  @Column({ default: 0 })
  totalSpins: number;

  @Column({ default: 0 })
  totalPrizes: number;

  @Column({ default: 0 })
  totalUsers: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
