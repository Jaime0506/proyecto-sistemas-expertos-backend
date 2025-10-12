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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthorizationService } from '../authorization.service';
import { AssignRoleToUserDto } from '../dtos/assign-role-to-user.dto';
import { AssignPermissionToRoleDto } from '../dtos/assign-permission-to-role.dto';
import { CheckPermissionDto } from '../dtos/check-permission.dto';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentsController {
	constructor(private readonly authorizationService: AuthorizationService) {}

	// ==================== ROLE-PERMISSION ASSIGNMENTS ====================

	@Post('permission-to-role')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Asignar un permiso a un rol' })
	@ApiResponse({
		status: 201,
		description: 'Permiso asignado al rol exitosamente',
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
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Revocar un permiso de un rol' })
	@ApiResponse({
		status: 200,
		description: 'Permiso revocado del rol exitosamente',
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
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Asignar un rol a un usuario' })
	@ApiResponse({
		status: 201,
		description: 'Rol asignado al usuario exitosamente',
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
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Revocar un rol de un usuario' })
	@ApiResponse({
		status: 200,
		description: 'Rol revocado del usuario exitosamente',
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
	@ApiOperation({ summary: 'Obtener roles de un usuario' })
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
		status: 500,
		description: 'Error interno del servidor',
	})
	async getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
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
		summary: 'Verificar si un usuario tiene un permiso específico',
	})
	@ApiResponse({
		status: 200,
		description: 'Verificación de permiso completada',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async hasPermission(@Body() checkDto: CheckPermissionDto) {
		return await this.authorizationService.hasPermission(checkDto);
	}
}
