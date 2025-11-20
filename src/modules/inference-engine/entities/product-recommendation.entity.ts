import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'product_recommendations', schema: 'sys' })
export class ProductRecommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  evaluation_session_id: number;

  @Column({ type: 'varchar', length: 50 })
  product_code: string;

  @Column({ type: 'varchar', length: 200 })
  product_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  max_amount?: number;

  @Column({ type: 'integer', nullable: true })
  max_term_months?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interest_rate?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence?: number;

  @ManyToOne('EvaluationSession', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluation_session: any;

  @OneToMany('ProductRecommendationSpecialCondition', 'product_recommendation', { cascade: true })
  special_conditions?: any[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

