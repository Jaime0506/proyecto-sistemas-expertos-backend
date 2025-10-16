import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
} from 'typeorm';

@Entity({ name: 'rules', schema: 'sys' })
export class Rule {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	name?: string;

	@Column()
	failure_id: number;

	@Column({ default: 'AND' })
	logic_type: string;

	@Column({ type: 'text', nullable: true })
	description?: string;
}
