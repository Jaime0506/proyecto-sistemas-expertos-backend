import {
	Controller,
	Post,
	Delete,
	Body,
	Param,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	Get,
	UseGuards,
	ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthorizationService } from '../authorization.service';
import { AssignRoleToUserDto } from '../dtos/assign-role-to-user.dto';
import { AssignPermissionToRoleDto } from '../dtos/assign-permission-to-role.dto';
import { CheckPermissionDto } from '../dtos/check-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import type { RequestUser } from '../../auth/strategy/jwt.strategy';
import { UserType } from '../../auth/entities/refresh-token.entity';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
	constructor(private readonly authorizationService: AuthorizationService) {}

	// ==================== ROLE-PERMISSION ASSIGNMENTS ====================

	@Post('permission-to-role')
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Asignar un permiso a un rol (Solo Administradores)' })
	@ApiResponse({
		status: 201,
		description: 'Permiso asignado al rol exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 404,
		description: 'Rol o permiso no encontrado',
	})
	@ApiResponse({
		status: 409,
		description: 'El permiso ya está asignado al rol',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async assignPermissionToRole(@Body() assignDto: AssignPermissionToRoleDto) {
		return await this.authorizationService.assignPermissionToRole(
			assignDto,
		);
	}

	@Delete('permission-from-role')
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Revocar un permiso de un rol (Solo Administradores)' })
	@ApiResponse({
		status: 200,
		description: 'Permiso revocado del rol exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 404,
		description: 'Asignación de permiso no encontrada',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async revokePermissionFromRole(
		@Body() assignDto: AssignPermissionToRoleDto,
	) {
		return await this.authorizationService.revokePermissionFromRole(
			assignDto,
		);
	}

	// ==================== USER-ROLE ASSIGNMENTS ====================

	@Post('role-to-user')
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Asignar un rol a un usuario (Solo Administradores)' })
	@ApiResponse({
		status: 201,
		description: 'Rol asignado al usuario exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 404,
		description: 'Usuario o rol no encontrado',
	})
	@ApiResponse({
		status: 409,
		description: 'El rol ya está asignado al usuario',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async assignRoleToUser(@Body() assignDto: AssignRoleToUserDto) {
		return await this.authorizationService.assignRoleToUser(assignDto);
	}

	@Delete('role-from-user')
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Revocar un rol de un usuario (Solo Administradores)' })
	@ApiResponse({
		status: 200,
		description: 'Rol revocado del usuario exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 404,
		description: 'Asignación de rol no encontrada',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async revokeRoleFromUser(@Body() assignDto: AssignRoleToUserDto) {
		return await this.authorizationService.revokeRoleFromUser(assignDto);
	}

	// ==================== QUERY ENDPOINTS ====================

	@Get('user/:userId/roles')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener roles de un usuario (Puedes ver tus propios roles o ser administrador)' })
	@ApiParam({
		name: 'userId',
		description: 'ID del usuario',
		type: 'number',
	})
	@ApiResponse({
		status: 200,
		description: 'Roles del usuario obtenidos exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'Solo puedes ver tus propios roles',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getUserRoles(
		@Param('userId', ParseIntPipe) userId: number,
		@CurrentUser() user: RequestUser
	) {
		// Los usuarios solo pueden ver sus propios roles, los administradores pueden ver cualquier usuario
		if (user.userType !== UserType.ADMINISTRADOR && user.id !== userId) {
			throw new ForbiddenException('Solo puedes ver tus propios roles');
		}
		return await this.authorizationService.getUserRoles(userId);
	}

	@Get('role/:roleId/permissions')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener permisos de un rol' })
	@ApiParam({
		name: 'roleId',
		description: 'ID del rol',
		type: 'number',
	})
	@ApiResponse({
		status: 200,
		description: 'Permisos del rol obtenidos exitosamente',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getRolePermissions(@Param('roleId', ParseIntPipe) roleId: number) {
		return await this.authorizationService.getRolePermissions(roleId);
	}

	@Post('check-permission')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Verificar si el usuario autenticado tiene un permiso específico',
	})
	@ApiResponse({
		status: 200,
		description: 'Verificación de permiso completada',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async hasPermission(
		@Body() checkDto: CheckPermissionDto,
		@CurrentUser() user: RequestUser
	) {
		// Usar el ID del usuario autenticado
		return await this.authorizationService.hasPermission({
			...checkDto,
			user_id: user.id
		});
	}
}
