import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { Experto } from '../users/entities/experto.entity';
import { Administrador } from '../users/entities/administrador.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthorizationModule } from '../authorization/authorization.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
	imports: [
		TypeOrmModule.forFeature([Experto, Administrador, Cliente, RefreshToken]),
		UsersModule,
		AuthorizationModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: '30m',
				},
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
	exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
