import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { StatusEnum } from '../../users/entities/user.entity';

@Entity({ name: 'roles_permissions', schema: 'sys' })
@Unique(['role_id', 'permission_id'])
export class RolePermission {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'role_id', type: 'int', nullable: false })
	role_id: number;

	@Column({ name: 'permission_id', type: 'int', nullable: false })
	permission_id: number;

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

	@ManyToOne(() => Role, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'role_id' })
	role: Role;

	@ManyToOne(() => Permission, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'permission_id' })
	permission: Permission;
}
