import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Experto } from './entities/experto.entity';
import { Administrador } from './entities/administrador.entity';
import { Cliente } from './entities/cliente.entity';
import { Role } from '../authorization/entities/role.entity';
import { ExpertoRole } from '../authorization/entities/experto-role.entity';
import { AdministradorRole } from '../authorization/entities/administrador-role.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Experto, Administrador, Cliente, Role, ExpertoRole, AdministradorRole])],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
