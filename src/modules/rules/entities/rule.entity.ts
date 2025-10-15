import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from 'typeorm';

@Entity({ name: 'rules', schema: 'sys' })
export class Rule {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	name?: string;

	@ManyToOne('Failure', 'rules', { onDelete: 'CASCADE' })
	failure: any;

	@Column()
	failure_id: number;

	@Column({ default: 'AND' })
	logic_type: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@OneToMany('RuleFact', 'rule')
	ruleFacts?: any[];
}
