import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
} from 'typeorm';

@Entity({ name: 'options', schema: 'sys' })
export class Option {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne('Question', 'options', { onDelete: 'CASCADE' })
	question: any;

	@Column()
	question_id: number;

	@Column({ type: 'text' })
	text: string;

	@Column({ type: 'smallint', default: 0 })
	order_num: number;

	@OneToMany('OptionFact', 'option')
	optionFacts?: any[];
}
