import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique,
} from 'typeorm';
import { Administrador } from '../../users/entities/administrador.entity';
import { Role } from './role.entity';
import { StatusEnum } from '../../users/entities/user.entity';

@Entity({ name: 'administradores_roles', schema: 'sys' })
@Unique(['administrador_id', 'role_id'])
export class AdministradorRole {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'administrador_id', type: 'int', nullable: false })
	administrador_id: number;

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

	@ManyToOne(() => Administrador, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'administrador_id' })
	administrador: Administrador;

	@ManyToOne(() => Role, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'role_id' })
	role: Role;
}

