import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'option_fact', schema: 'sys' })
export class OptionFact {
	@PrimaryColumn()
	option_id: number;

	@PrimaryColumn()
	fact_id: number;

	@ManyToOne('Option', 'optionFacts', { onDelete: 'CASCADE' })
	option: any;

	@ManyToOne('Fact', 'optionFacts', { onDelete: 'CASCADE' })
	fact: any;
}
