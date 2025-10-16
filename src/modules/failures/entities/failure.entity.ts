import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'failures', schema: 'sys' })
export class Failure {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;
}
