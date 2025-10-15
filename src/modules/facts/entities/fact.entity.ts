import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'facts', schema: 'sys' })
export class Fact {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	code: string;

	@Column({ type: 'text' })
	description: string;

	@OneToMany('OptionFact', 'fact')
	optionFacts?: any[];

	@OneToMany('RuleFact', 'fact')
	ruleFacts?: any[];
}
