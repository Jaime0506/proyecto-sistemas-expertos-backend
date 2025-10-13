// src/modules/auth/entities/refresh-token.entity.ts
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';

@Entity({ schema: 'sys', name: 'refresh_tokens' })
export class RefreshToken {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: 'user_id', type: 'int' })
	userId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ name: 'token_hash', type: 'varchar', length: 255 })
	tokenHash: string;

	@Column({
		name: 'created_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;

	@Column({ name: 'expires_at', type: 'timestamp', nullable: true })
	expiresAt: Date | null;

	@Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
	revokedAt: Date | null;

	@Column({ name: 'replaced_by', type: 'int', nullable: true })
	replacedBy: number | null;
}
