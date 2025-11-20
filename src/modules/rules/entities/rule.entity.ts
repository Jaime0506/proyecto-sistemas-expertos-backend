import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { Failure } from '../../failures/entities/failure.entity';
import { Experto } from '../../users/entities/experto.entity';

@Entity({ name: 'rules', schema: 'sys' })
export class Rule {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 10, unique: true, nullable: false })
	code: string; // R001, R002, etc.

	@Column({ type: 'varchar', length: 100, nullable: true })
	name?: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	category?: string; // ADMISIBILIDAD, RIESGO, PRODUCTO, NORMATIVA, ESPECIAL

	@Column()
	failure_id: number;

	@Column({ default: 'AND' })
	logic_type: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	success_action?: string; // Acción cuando la regla pasa (ej: RIESGO_BAJO, CREDITO_HIPOTECARIO)

	@Column({ type: 'integer', nullable: true })
	priority?: number; // Prioridad de la regla

	@Column({ type: 'integer', nullable: true })
	created_by?: number;

	@Column({ type: 'integer', nullable: true })
	updated_by?: number;

	@ManyToOne(() => Failure, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'failure_id' })
	failure: Failure;

	@ManyToOne(() => Experto, { nullable: true })
	@JoinColumn({ name: 'created_by' })
	creator?: Experto;

	@ManyToOne(() => Experto, { nullable: true })
	@JoinColumn({ name: 'updated_by' })
	updater?: Experto;

	@OneToMany('RuleFact', 'rule')
	rule_facts?: any[];
}
