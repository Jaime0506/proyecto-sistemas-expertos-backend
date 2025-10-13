// src/modules/auth/auth.controller.ts
import {
	Controller,
	Post,
	Body,
	Res,
	Req,
	UnauthorizedException,
	BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshDto } from './dtos/refresh.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';

@Controller('auth')
export class AuthController {
	private cookieName: string;
	private cookieSecure: boolean;
	private sameSite: 'strict' | 'lax' | 'none';

	constructor(
		private authService: AuthService,
		private configService: ConfigService,
		private usersService: UsersService,
	) {
		this.cookieName =
			this.configService.get<string>('JWT_REFRESH_TOKEN_COOKIE_NAME') ||
			'refresh_token';

		// Configuración inteligente para desarrollo/producción
		const isProduction =
			this.configService.get<string>('NODE_ENV') === 'production';
		this.cookieSecure =
			isProduction &&
			(this.configService.get<string>(
				'JWT_REFRESH_TOKEN_COOKIE_SECURE',
			) || 'true') === 'true';
		this.sameSite = isProduction ? 'strict' : 'lax';
	}

	@Post('login')
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const user = await this.authService.validateUser(
			dto.username,
			dto.password,
		);
		if (!user) throw new UnauthorizedException('Invalid credentials');

		const result = await this.authService.login(user);

		const {
			data: { refreshToken },
		} = result;

		// set cookie HttpOnly with refresh token
		res.cookie(this.cookieName, refreshToken, {
			httpOnly: true,
			secure: this.cookieSecure,
			sameSite: this.sameSite,
			path: '/',
			maxAge:
				Number(this.configService.get<number>('JWT_REFRESH_TTL') || 7) *
				24 *
				60 *
				60 *
				1000,
		});

		return result;
	}

	@Post('refresh')
	async refresh(
		@Req() req: Request,
		@Body() dto: RefreshDto,
		@Res({ passthrough: true }) res: Response,
	) {
		// prefer cookie, fallback to body
		const cookieToken = (req.cookies as Record<string, string>)?.[
			this.cookieName
		];

		const token = cookieToken || dto.refreshToken;
		if (!token) {
			throw new UnauthorizedException('No refresh token provided');
		}

		const result = await this.authService.refresh(token);

		const {
			data: { refreshToken },
		} = result;

		// set new refresh token cookie (rotation)
		res.cookie(this.cookieName, refreshToken, {
			httpOnly: true,
			secure: this.cookieSecure,
			sameSite: this.sameSite,
			path: '/',
			maxAge:
				Number(this.configService.get<number>('JWT_REFRESH_TTL') || 7) *
				24 *
				60 *
				60 *
				1000,
		});

		return result;
	}

	@Post('logout')
	async logout(
		@Req() req: Request,
		@Body() dto: RefreshDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const cookieToken = (req.cookies as Record<string, string>)?.[
			this.cookieName
		];
		const token = (cookieToken || dto.refreshToken) as string;

		if (token) {
			await this.authService.logout(token);
		} else if (req.user && (req.user as { id: number }).id) {
			await this.authService.logout(
				undefined,
				(req.user as { id: number }).id,
			); // revoke all tokens
		}

		// clear cookie
		res.clearCookie(this.cookieName, { path: '/' });
		return { ok: true, message: 'Logout exitoso' };
	}

	@Post('register')
	async register(@Body() dto: CreateUserDto) {
		try {
			return await this.authService.register(dto);
		} catch (error: any) {
			if ((error as { code?: string })?.code === '23505') {
				// PostgreSQL unique constraint violation
				throw new BadRequestException('El usuario ya existe');
			}
			throw error;
		}
	}
}
