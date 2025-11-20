import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rule } from '../../rules/entities/rule.entity';
import { Fact } from '../../facts/entities/fact.entity';

@Entity({ name: 'rule_facts', schema: 'sys' })
export class RuleFact {
	@PrimaryColumn()
	rule_id: number;

	@PrimaryColumn()
	fact_id: number;

	@Column({ type: 'smallint', default: 0 })
	position: number;

	@ManyToOne(() => Rule, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'rule_id' })
	rule: Rule;

	@ManyToOne(() => Fact, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'fact_id' })
	fact: Fact;
}
