import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'product_recommendation_special_conditions', schema: 'sys' })
export class ProductRecommendationSpecialCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  product_recommendation_id: number;

  @Column({ type: 'text' })
  condition_text: string;

  @ManyToOne('ProductRecommendation', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_recommendation_id' })
  product_recommendation: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

