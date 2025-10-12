import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';
import { StatusEnum } from '../../users/entities/user.entity';

@Entity({ name: 'users_roles', schema: 'sys' })
@Unique(['user_id', 'role_id'])
export class UserRole {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'user_id', type: 'int', nullable: false })
	user_id: number;

	@Column({ name: 'role_id', type: 'int', nullable: false })
	role_id: number;

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

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Role, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'role_id' })
	role: Role;
}
