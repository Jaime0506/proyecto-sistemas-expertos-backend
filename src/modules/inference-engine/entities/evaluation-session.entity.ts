import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'evaluation_sessions', schema: 'sys' })
export class EvaluationSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  session_id: string;

  @Column({ type: 'integer', nullable: true })
  user_id: number;

  @Column({ type: 'jsonb' })
  input_data: any; // Datos de entrada del usuario (respuestas del survey)

  @Column({ type: 'jsonb', nullable: true })
  facts_detected: any; // Facts detectados basados en input_data

  @Column({ type: 'jsonb', nullable: true })
  evaluation_result: any; // Resultado completo de la evaluación

  @Column({ type: 'varchar', length: 50, nullable: true })
  final_decision: string; // APROBADO, RECHAZADO, CONDICIONADO, PENDIENTE

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_profile: string; // BAJO, MEDIO, ALTO

  @Column({ type: 'jsonb', nullable: true })
  recommended_products: any; // Productos recomendados

  @Column({ type: 'text', nullable: true })
  explanation: string; // Explicación de la decisión

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number; // Nivel de confianza (0-100)

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string; // PENDING, COMPLETED, FAILED

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
