// src/modules/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthorizationService } from '../../authorization/authorization.service';
import { StatusEnum } from '../../users/entities/user.entity';
import { UserType } from '../entities/refresh-token.entity';

type JwtPayload = {
	sub: number;
	username: string;
	email: string;
	userType?: UserType;
};

export interface RequestUser {
	id: number;
	username: string;
	email: string;
	userType: UserType;
	roles: string[];
	permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
	constructor(
		private configService: ConfigService,
		private usersService: UsersService,
		private authorizationService: AuthorizationService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
			ignoreExpiration: false,
		});
	}

	async validate(payload: JwtPayload): Promise<RequestUser | null> {
		// payload.sub === userId
		// Optionally fetch user to ensure still active
		const user = await this.usersService.findUserById(payload.sub);

		const userData = user.data;

		if (!userData || userData.status !== StatusEnum.ACTIVE) {
			return null;
		}

		// Obtener userType del payload o del userData
		const userType = payload.userType || (userData as any).type || UserType.CLIENTE;

		// Obtener roles y permisos del usuario
		let roles: string[] = [];
		let permissions: string[] = [];

			try {
				// Solo obtener roles si no es cliente (clientes no tienen roles)
				if (userType !== UserType.CLIENTE) {
					const userRolesResult = await this.authorizationService.getUserRoles(userData.id);
					if (userRolesResult.data && Array.isArray(userRolesResult.data)) {
						roles = userRolesResult.data.map((ur: any) => ur.role?.name).filter(Boolean);
					}

					const userPermissionsResult = await this.authorizationService.getUserPermissions(userData.id);
					if (userPermissionsResult.data && Array.isArray(userPermissionsResult.data)) {
						permissions = userPermissionsResult.data;
					}
				}

				// Agregar el userType como rol también para facilitar la verificación
				roles.push(userType);
			} catch (error) {
				console.error('Error obteniendo roles y permisos:', error);
				// Continuar sin roles/permisos si hay error
			}

		// return user object with roles and permissions attached to req.user
		return {
			id: userData.id,
			username: userData.username,
			email: userData.email,
			userType: userType as UserType,
			roles,
			permissions,
		};
	}
}
