import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'evaluation_result_special_conditions', schema: 'sys' })
export class EvaluationResultSpecialCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  evaluation_result_id: number;

  @Column({ type: 'varchar', length: 100 })
  condition_code: string;

  @Column({ type: 'text', nullable: true })
  condition_description?: string;

  @ManyToOne('EvaluationResults', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_result_id' })
  evaluation_result: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

