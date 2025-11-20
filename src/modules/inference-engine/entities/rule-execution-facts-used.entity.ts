import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fact } from '../../facts/entities/fact.entity';

@Entity({ name: 'rule_execution_facts_used', schema: 'sys' })
export class RuleExecutionFactsUsed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  rule_execution_id: number;

  @Column({ type: 'varchar', length: 100 })
  fact_code: string;

  @Column({ type: 'integer', nullable: true })
  fact_id?: number;

  @ManyToOne('RuleExecution', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_execution_id' })
  rule_execution: any;

  @ManyToOne(() => Fact, { nullable: true })
  @JoinColumn({ name: 'fact_id' })
  fact?: Fact;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

