import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Experto } from '../../users/entities/experto.entity';

@Entity({ name: 'failures', schema: 'sys' })
export class Failure {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'integer', nullable: true })
	created_by?: number;

	@Column({ type: 'integer', nullable: true })
	updated_by?: number;

	@ManyToOne(() => Experto, { nullable: true })
	@JoinColumn({ name: 'created_by' })
	creator?: Experto;

	@ManyToOne(() => Experto, { nullable: true })
	@JoinColumn({ name: 'updated_by' })
	updater?: Experto;
}
