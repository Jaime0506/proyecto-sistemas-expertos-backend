import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Experto } from '../../users/entities/experto.entity';

@Entity({ name: 'facts', schema: 'sys' })
export class Fact {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	code: string;

	@Column({ type: 'text' })
	description: string;

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
