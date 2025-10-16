import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'facts', schema: 'sys' })
export class Fact {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	code: string;

	@Column({ type: 'text' })
	description: string;
}
