import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fact } from '../../facts/entities/fact.entity';

@Entity({ name: 'evaluation_facts_detected', schema: 'sys' })
export class EvaluationFactsDetected {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  evaluation_session_id: number;

  @Column({ type: 'varchar', length: 100 })
  fact_code: string;

  @Column({ type: 'integer', nullable: true })
  fact_id?: number;

  @ManyToOne('EvaluationSession', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluation_session: any;

  @ManyToOne(() => Fact, { nullable: true })
  @JoinColumn({ name: 'fact_id' })
  fact?: Fact;

  @CreateDateColumn({ type: 'timestamp' })
  detected_at: Date;
}

