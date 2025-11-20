import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Rule } from '../../rules/entities/rule.entity';

@Entity({ name: 'rule_executions', schema: 'sys' })
export class RuleExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  evaluation_session_id: number;

  @Column({ type: 'integer' })
  rule_id: number;

  @Column({ type: 'boolean' })
  rule_applied: boolean; // Si la regla se aplicó o no

  @Column({ type: 'varchar', length: 20 })
  result: string; // PASS, FAIL, NOT_APPLICABLE

  @Column({ type: 'text', nullable: true })
  failure_detected: string; // Failure detectado si aplica

  @Column({ type: 'text', nullable: true })
  explanation: string; // Explicación de por qué se aplicó o no

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  execution_time_ms: number; // Tiempo de ejecución en milisegundos

  @CreateDateColumn({ type: 'timestamp' })
  executed_at: Date;

  @ManyToOne('EvaluationSession', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluation_session: any;

  @ManyToOne(() => Rule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rule_id' })
  rule: Rule;

  @OneToMany('RuleExecutionCondition', 'rule_execution', { cascade: true })
  rule_conditions?: any[];

  @OneToMany('RuleExecutionFactsUsed', 'rule_execution', { cascade: true })
  rule_facts_used?: any[];
}
