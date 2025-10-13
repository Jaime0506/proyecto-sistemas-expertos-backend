// src/modules/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import { StatusEnum } from 'src/modules/users/entities/user.entity';

type JwtPayload = {
	sub: number;
	username: string;
};

export interface RequestUser {
	id: number;
	username: string;
	email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
	constructor(
		private configService: ConfigService,
		private usersService: UsersService,
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
		// return minimal user object to be attached to req.user
		return {
			id: userData.id,
			username: userData.username,
			email: userData.email,
		};
	}
}
