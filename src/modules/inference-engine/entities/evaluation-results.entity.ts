import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'evaluation_results', schema: 'sys' })
export class EvaluationResults {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  evaluation_session_id: number;

  @ManyToOne('EvaluationSession', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluation_session: any;

  @Column({ type: 'integer', nullable: true })
  facts_count?: number;

  @Column({ type: 'integer', nullable: true })
  rule_executions_count?: number;

  @Column({ type: 'integer', nullable: true })
  failures_count?: number;

  @Column({ type: 'integer', nullable: true })
  recommended_products_count?: number;

  @Column({ type: 'integer', nullable: true })
  special_conditions_count?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_profile?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_base?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_failures_penalty?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_failed_rules_penalty?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_positive_facts_bonus?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_successful_rules_bonus?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  execution_conversion_time_ms?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  execution_forward_chaining_time_ms?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  execution_total_time_ms?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany('EvaluationResultFailure', 'evaluation_result', { cascade: true })
  failures?: any[];

  @OneToMany('EvaluationResultSpecialCondition', 'evaluation_result', { cascade: true })
  special_conditions?: any[];
}

