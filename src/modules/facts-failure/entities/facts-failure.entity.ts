import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Fact } from '../../facts/entities/fact.entity';
import { Failure } from '../../failures/entities/failure.entity';

@Entity({ name: 'facts_failures', schema: 'sys' })
@Unique(['fact_id', 'failure_id'])
export class FactsFailure {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Fact, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'fact_id' })
	fact: Fact;

	@Column()
	fact_id: number;

	@ManyToOne(() => Failure, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'failure_id' })
	failure: Failure;

	@Column()
	failure_id: number;
}
