import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { AssignmentsController } from './controllers/assignments.controller';
import { Experto } from '../users/entities/experto.entity';
import { Administrador } from '../users/entities/administrador.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { ExpertoRole } from './entities/experto-role.entity';
import { AdministradorRole } from './entities/administrador-role.entity';
import { RolePermission } from './entities/role-permission.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Experto,
			Administrador,
			Role,
			Permission,
			ExpertoRole,
			AdministradorRole,
			RolePermission,
		]),
	],
	controllers: [
		AuthorizationController,
		RolesController,
		PermissionsController,
		AssignmentsController,
	],
	providers: [AuthorizationService],
	exports: [AuthorizationService],
})
export class AuthorizationModule {}
