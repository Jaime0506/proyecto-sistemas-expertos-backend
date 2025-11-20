// src/modules/auth/auth.service.ts
import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
	InternalServerErrorException,
	ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { UsersService } from '../users/users.service';

import { randomBytes, createHash } from 'crypto';
import { StatusEnum } from '../users/entities/user.entity';
import { Experto } from '../users/entities/experto.entity';
import { Administrador } from '../users/entities/administrador.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { comparePassword } from '../../utils/password.utility';
import { processTransaction } from '../../utils/transaction';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserType } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
	private refreshTokenExpiresDays: number;
	private refreshCookieName: string;
	private refreshTokenPepper?: string;

	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		@InjectRepository(RefreshToken)
		private refreshRepo: Repository<RefreshToken>,
		private usersService: UsersService,
		private dataSource: DataSource,
	) {
		const refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL');
		
		// Parsear el valor (puede ser '7d', '7', etc.)
		if (refreshTtl && typeof refreshTtl === 'string') {
			// Extraer solo el número si hay 'd' al final
			const numericValue = refreshTtl.replace('d', '');
			this.refreshTokenExpiresDays = Number(numericValue) || 7;
		} else {
			this.refreshTokenExpiresDays = 7;
		}
		
		// Validar que el número sea válido
		if (isNaN(this.refreshTokenExpiresDays) || this.refreshTokenExpiresDays <= 0) {
			console.log('⚠️ JWT_REFRESH_TTL inválido, usando valor por defecto: 7 días');
			this.refreshTokenExpiresDays = 7;
		}
		
		console.log(`🔧 Refresh token expires in: ${this.refreshTokenExpiresDays} days`);
		
		this.refreshCookieName =
			this.configService.get<string>('JWT_REFRESH_TOKEN_COOKIE_NAME') ||
			'refresh_token';
		this.refreshTokenPepper = this.configService.get<string>(
			'JWT_REFRESH_TOKEN_PEPPER',
		);
	}

	// Validar credenciales
	async validateUser(username: string, password: string) {
		console.log('🔍 Validating user:', { username });
		
		const user = await this.usersService.findUserByUsername(username);
		console.log('🔍 User found:', { userExists: !!user?.data, status: user?.status });

		const userData = user?.data;

		if (!userData) {
			console.log('❌ User not found or data is null');
			return null;
		}

		if (userData.status !== StatusEnum.ACTIVE) {
			console.log('❌ User is not active:', { status: userData.status });
			return null;
		}

		const match = await comparePassword(password, userData.password_hash);
		console.log('🔍 Password match:', { match });
		
		if (!match) return null;
		
		// Asegurar que el tipo esté incluido
		const userType = (userData as any).type;
		return { ...userData, type: userType };
	}

	private hashRefreshToken(token: string) {
		// sha256 + optional pepper
		const h = createHash('sha256');
		h.update(token + (this.refreshTokenPepper || ''));
		return h.digest('hex');
	}

	private generateRefreshTokenPlain(): string {
		return randomBytes(64).toString('hex');
	}

	async login(user: Experto | Administrador | Cliente & { type?: string }) {
		// Determinar el tipo de usuario
		const userType = (user as any).type || 
			(user instanceof Experto ? UserType.EXPERTO :
			 user instanceof Administrador ? UserType.ADMINISTRADOR :
			 UserType.CLIENTE);

		const payload = {
			sub: user.id,
			username: user.username,
			email: user.email,
			userType: userType,
		};
		const accessToken = await this.jwtService.signAsync(payload);

		// generar refresh token raw y guardar hash
		const refreshPlain = this.generateRefreshTokenPlain();
		const tokenHash = this.hashRefreshToken(refreshPlain);
		const expiresAt = new Date(
			Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
		);

		const refresh = this.refreshRepo.create({
			userId: user.id,
			userType: userType,
			tokenHash,
			expiresAt,
		});
		await this.refreshRepo.save(refresh);

		return {
			message: 'Login exitoso',
			data: {
				user: { ...user, type: userType },
				accessToken,
				refreshToken: refreshPlain,
				expiresIn:
					this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
			},
		};
	}

	// refresh with rotation
	async refresh(oldRefreshTokenPlain: string) {
		if (!oldRefreshTokenPlain) {
			throw new UnauthorizedException('No refresh token provided');
		}

		const oldHash = this.hashRefreshToken(oldRefreshTokenPlain);

		// Buscamos el token por su hash
		const existing = await this.refreshRepo.findOne({
			where: { tokenHash: oldHash },
		});

		// Si no existe → posible token inválido / no reconocido
		if (!existing) {
			throw new UnauthorizedException('Refresh token not found');
		}

		// Si el token ya fue revocado → posible reuse (replay)
		if (existing.revokedAt) {
			// Revoke all tokens for that user as a security measure
			await this.refreshRepo.update(
				{ userId: existing.userId },
				{ revokedAt: new Date() },
			);
			throw new UnauthorizedException(
				'Refresh token revoked (possible reuse). All tokens revoked.',
			);
		}

		// Expiración
		if (existing.expiresAt && existing.expiresAt < new Date()) {
			throw new UnauthorizedException('Refresh token expired');
		}

		// Generar nuevo refresh token (plain) y su hash
		const newPlain = this.generateRefreshTokenPlain();
		const newHash = this.hashRefreshToken(newPlain);
		const newExpiresAt = new Date(
			Date.now() + this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
		);

		// Usamos tu helper processTransaction para crear el nuevo token y actualizar el antiguo en una sola transacción
		const createdToken = await processTransaction(
			this.dataSource,
			async (queryRunner) => {
				// 1) Crear y guardar nuevo token usando queryRunner.manager
				const newTokenEntity = queryRunner.manager.create(
					RefreshToken,
					{
						userId: existing.userId,
						userType: existing.userType,
						tokenHash: newHash,
						expiresAt: newExpiresAt,
					},
				);
				const savedNew = await queryRunner.manager.save(newTokenEntity);

				// 2) Actualizar el token antiguo: marcar revoked_at y replaced_by
				existing.revokedAt = new Date();
				existing.replacedBy = savedNew.id;
				await queryRunner.manager.save(existing);

				// retornar el nuevo token guardado (o lo que necesites)
				return savedNew;
			},
		);

		// Con el nuevo token creado, generamos el access token
		const result = await this.usersService.findUserById(existing.userId);

		const user = result?.data;

		if (!user || user.status !== StatusEnum.ACTIVE) {
			// seguridad: si el usuario ya no existe o está desactivado, revocamos el nuevo token también
			await this.refreshRepo.update(
				{ id: createdToken.id },
				{ revokedAt: new Date() },
			);
			throw new UnauthorizedException(
				'User no longer available or inactive',
			);
		}

		const userType = (user as any).type || existing.userType;
		const payload = {
			sub: user.id,
			username: user.username,
			email: user.email,
			userType: userType,
		};
		const accessToken = await this.jwtService.signAsync(payload);

		// devolver accessToken y el nuevo refresh token plain (para setear cookie)
		return {
			message: 'Refresh exitoso',
			data: {
				user,
				accessToken,
				refreshToken: newPlain,
				expiresIn:
					this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
			},
		};
	}

	async logout(refreshTokenPlain?: string, userId?: number) {
		if (refreshTokenPlain) {
			const hash = this.hashRefreshToken(refreshTokenPlain);
			await this.refreshRepo.update(
				{ tokenHash: hash },
				{ revokedAt: new Date() },
			);
		} else if (userId) {
			// revoke all tokens for user
			await this.refreshRepo.update(
				{ userId },
				{ revokedAt: new Date() },
			);
		} else {
			throw new BadRequestException(
				'No token or userId provided for logout',
			);
		}
	}

	async register(user: CreateUserDto) {
		try {
			const result = await this.usersService.createUser(user);
			return result;
		} catch (error) {
			console.error('Error en registro:', error);
			
			// Si es un error de validación o conflicto, lo re-lanzamos
			if (error instanceof ConflictException || error instanceof BadRequestException) {
				throw error;
			}
			
			// Para otros errores, lanzamos un error interno con más detalles
			throw new InternalServerErrorException(
				`Error al registrar el usuario: ${error.message || 'Error desconocido'}`,
			);
		}
	}
}
