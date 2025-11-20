import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Failure } from '../../failures/entities/failure.entity';

@Unique(['evaluation_result_id', 'failure_code'])
@Entity({ name: 'evaluation_result_failures', schema: 'sys' })
export class EvaluationResultFailure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  evaluation_result_id: number;

  @Column({ type: 'varchar', length: 100 })
  failure_code: string;

  @Column({ type: 'integer', nullable: true })
  failure_id?: number;

  @ManyToOne('EvaluationResults', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_result_id' })
  evaluation_result: any;

  @ManyToOne(() => Failure, { nullable: true })
  @JoinColumn({ name: 'failure_id' })
  failure?: Failure;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

