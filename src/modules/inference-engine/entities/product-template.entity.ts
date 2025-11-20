import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Experto } from '../../users/entities/experto.entity';

@Entity({ name: 'product_templates', schema: 'sys' })
export class ProductTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  product_code: string;

  @Column({ type: 'varchar', length: 200 })
  product_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_max_amount_multiplier?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  base_max_amount_fixed?: number;

  @Column({ type: 'integer', nullable: true })
  max_term_months?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  base_interest_rate?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interest_rate_risk_low?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interest_rate_risk_medium?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interest_rate_risk_high?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  base_confidence: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'integer', nullable: true })
  created_by?: number;

  @Column({ type: 'integer', nullable: true })
  updated_by?: number;

  @ManyToOne(() => Experto, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: Experto;

  @ManyToOne(() => Experto, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater?: Experto;

  @OneToMany('ProductTemplateSpecialCondition', 'product_template', { cascade: true })
  special_conditions?: any[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

