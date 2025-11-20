import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'product_template_special_conditions', schema: 'sys' })
export class ProductTemplateSpecialCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  product_template_id: number;

  @Column({ type: 'text' })
  condition_text: string;

  @ManyToOne('ProductTemplate', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_template_id' })
  product_template: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

