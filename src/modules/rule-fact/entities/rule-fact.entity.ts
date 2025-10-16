import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'rule_facts', schema: 'sys' })
export class RuleFact {
	@PrimaryColumn()
	rule_id: number;

	@PrimaryColumn()
	fact_id: number;

	@Column({ type: 'smallint', default: 0 })
	position: number;
}
