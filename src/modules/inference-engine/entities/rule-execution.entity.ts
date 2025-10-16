import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EvaluationSession } from './evaluation-session.entity';

@Entity({ name: 'rule_executions', schema: 'sys' })
export class RuleExecution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  evaluation_session_id: number;

  @Column({ type: 'varchar', length: 10 })
  rule_code: string; // R001, R002, etc.

  @Column({ type: 'varchar', length: 100 })
  rule_name: string;

  @Column({ type: 'varchar', length: 50 })
  rule_category: string; // ADMISIBILIDAD, RIESGO, PRODUCTO, NORMATIVA, ESPECIAL

  @Column({ type: 'jsonb' })
  rule_conditions: any; // Condiciones evaluadas

  @Column({ type: 'jsonb' })
  rule_facts_used: any; // Facts utilizados en la evaluación

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

  @Column({ type: 'integer', nullable: true })
  priority: number; // Prioridad de la regla

  @CreateDateColumn({ type: 'timestamp' })
  executed_at: Date;

  @ManyToOne(() => EvaluationSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluation_session: EvaluationSession;
}
