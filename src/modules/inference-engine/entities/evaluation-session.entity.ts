import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Cliente } from '../../users/entities/cliente.entity';

@Entity({ name: 'evaluation_sessions', schema: 'sys' })
export class EvaluationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  session_id: string;

  @Column({ type: 'integer', nullable: true })
  cliente_id: number;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'varchar', length: 50, nullable: true })
  final_decision: string; // APROBADO, RECHAZADO, CONDICIONADO, PENDIENTE

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_profile: string; // BAJO, MEDIO, ALTO

  @Column({ type: 'text', nullable: true })
  explanation: string; // Explicación de la decisión

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number; // Nivel de confianza (0-100)

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string; // PENDING, COMPLETED, FAILED

  @OneToOne('EvaluationInputData', 'evaluation_session', { cascade: true })
  input_data?: any;

  @OneToMany('EvaluationFactsDetected', 'evaluation_session', { cascade: true })
  facts_detected?: any[];

  @OneToOne('EvaluationResults', 'evaluation_session', { cascade: true })
  evaluation_result?: any;

  @OneToMany('ProductRecommendation', 'evaluation_session', { cascade: true })
  recommended_products?: any[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
