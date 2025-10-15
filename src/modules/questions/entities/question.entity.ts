import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'questions', schema: 'sys' })
export class Question {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'text' })
	text: string;

	@Column({ type: 'smallint', default: 0 })
	order_num: number;

	@OneToMany('Option', 'question')
	options?: any[];
}
