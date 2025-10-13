import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, RefreshToken]),
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
	providers: [AuthService],
})
export class AuthModule {}
