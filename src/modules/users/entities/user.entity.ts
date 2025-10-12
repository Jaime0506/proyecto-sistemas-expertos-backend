import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

export enum StatusEnum {
	ACTIVE = 'active',
	DESACTIVE = 'desactive',
}

@Entity({ name: 'users', schema: 'sys' })
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 50, unique: true, nullable: false })
	username: string;

	@Column({ type: 'varchar', length: 100, unique: true, nullable: false })
	email: string;

	@Column({ type: 'varchar', length: 255, nullable: false })
	password_hash: string;

	@Column({
		type: 'enum',
		enum: StatusEnum,
		default: StatusEnum.ACTIVE,
		nullable: false,
	})
	status: StatusEnum;

	@Column({ type: 'timestamp', nullable: true, default: null })
	deleted_at: Date | null;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}
