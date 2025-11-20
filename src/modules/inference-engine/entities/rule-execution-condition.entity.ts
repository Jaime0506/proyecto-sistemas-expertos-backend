import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'rule_execution_conditions', schema: 'sys' })
export class RuleExecutionCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  rule_execution_id: number;

  @Column({ type: 'varchar', length: 100 })
  condition_key: string;

  @Column({ type: 'text', nullable: true })
  condition_value?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condition_type?: string;

  @ManyToOne('RuleExecution', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_execution_id' })
  rule_execution: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

