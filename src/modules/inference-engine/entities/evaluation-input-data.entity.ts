import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'evaluation_input_data', schema: 'sys' })
export class EvaluationInputData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  evaluation_session_id: number;

  @OneToOne('EvaluationSession', 'input_data', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_session_id' })
  evaluation_session: any;

  @Column({ type: 'integer', nullable: true })
  age?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthly_income?: number;

  @Column({ type: 'integer', nullable: true })
  credit_score?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employment_status?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  credit_purpose?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  requested_amount?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  debt_to_income_ratio?: number;

  @Column({ type: 'integer', nullable: true })
  max_days_delinquency?: number;

  @Column({ type: 'integer', nullable: true })
  employment_tenure_months?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  payment_to_income_ratio?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  down_payment_percentage?: number;

  @Column({ type: 'boolean', nullable: true })
  has_co_borrower?: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  co_borrower_income?: number;

  @Column({ type: 'boolean', nullable: true })
  is_microenterprise?: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  economic_activity?: string;

  @Column({ type: 'boolean', nullable: true })
  is_pep?: boolean;

  @Column({ type: 'boolean', nullable: true })
  pep_committee_approval?: boolean;

  @Column({ type: 'integer', nullable: true })
  recent_inquiries?: number;

  @Column({ type: 'integer', nullable: true })
  customer_tenure_months?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  historical_compliance?: number;

  @Column({ type: 'boolean', nullable: true })
  is_convention_employee?: boolean;

  @Column({ type: 'boolean', nullable: true })
  payroll_discount_authorized?: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employment_type?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pension_amount?: number;

  @Column({ type: 'boolean', nullable: true })
  is_legal_pension?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

