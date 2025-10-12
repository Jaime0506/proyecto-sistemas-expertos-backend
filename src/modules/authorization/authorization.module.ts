import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { AssignmentsController } from './controllers/assignments.controller';
import { User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			Role,
			Permission,
			UserRole,
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
