import { Entity, PrimaryColumn, ManyToOne, Column } from 'typeorm';

@Entity({ name: 'rule_facts', schema: 'sys' })
export class RuleFact {
	@PrimaryColumn()
	rule_id: number;

	@PrimaryColumn()
	fact_id: number;

	@ManyToOne('Rule', 'ruleFacts', { onDelete: 'CASCADE' })
	rule: any;

	@ManyToOne('Fact', 'ruleFacts', { onDelete: 'CASCADE' })
	fact: any;

	@Column({ type: 'smallint', default: 0 })
	position: number;
}
