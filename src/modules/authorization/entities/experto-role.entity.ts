import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Unique,
} from 'typeorm';
import { Experto } from '../../users/entities/experto.entity';
import { Role } from './role.entity';
import { StatusEnum } from '../../users/entities/user.entity';

@Entity({ name: 'expertos_roles', schema: 'sys' })
@Unique(['experto_id', 'role_id'])
export class ExpertoRole {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'experto_id', type: 'int', nullable: false })
	experto_id: number;

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

	@ManyToOne(() => Experto, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'experto_id' })
	experto: Experto;

	@ManyToOne(() => Role, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'role_id' })
	role: Role;
}

