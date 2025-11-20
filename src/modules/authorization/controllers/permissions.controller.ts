import {
	Controller,
	Post,
	Put,
	Delete,
	Get,
	Body,
	Param,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	UseGuards,
	ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthorizationService } from '../authorization.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import type { RequestUser } from '../../auth/strategy/jwt.strategy';
import { UserType } from '../../auth/entities/refresh-token.entity';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
	constructor(private readonly authorizationService: AuthorizationService) {}

	@Get()
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener todos los permisos (Solo Administradores)' })
	@ApiResponse({
		status: 200,
		description: 'Permisos obtenidos exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getAllPermissions() {
		return await this.authorizationService.getPermissions();
	}

	@Post()
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Crear un nuevo permiso (Solo Administradores)' })
	@ApiResponse({
		status: 201,
		description: 'Permiso creado exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 409,
		description: 'El nombre del permiso ya existe',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
		return await this.authorizationService.createPermission(
			createPermissionDto,
		);
	}

	// Obtener los permisos de un usuario
	@Get('user/:userId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener los permisos de un usuario (Puedes ver tus propios permisos o ser administrador)' })
	@ApiParam({
		name: 'userId',
		description: 'ID del usuario',
		type: 'number',
	})
	@ApiResponse({
		status: 200,
		description: 'Permisos del usuario obtenidos exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'Solo puedes ver tus propios permisos',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getUserPermissions(
		@Param('userId', ParseIntPipe) userId: number,
		@CurrentUser() user: RequestUser
	) {
		// Los usuarios solo pueden ver sus propios permisos, los administradores pueden ver cualquier usuario
		if (user.userType !== UserType.ADMINISTRADOR && user.id !== userId) {
			throw new ForbiddenException('Solo puedes ver tus propios permisos');
		}
		return await this.authorizationService.getUserPermissions(userId);
	}

	@Put()
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Actualizar un permiso existente (Solo Administradores)' })
	@ApiResponse({
		status: 200,
		description: 'Permiso actualizado exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 404,
		description: 'Permiso no encontrado',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async updatePermission(@Body() updatePermissionDto: UpdatePermissionDto) {
		return await this.authorizationService.updatePermission(
			updatePermissionDto,
		);
	}

	@Delete(':id')
	@UseGuards(RolesGuard)
	@Roles(UserType.ADMINISTRADOR)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Eliminar un permiso (soft delete) (Solo Administradores)' })
	@ApiParam({
		name: 'id',
		description: 'ID del permiso a eliminar',
		type: 'number',
	})
	@ApiResponse({
		status: 200,
		description: 'Permiso eliminado exitosamente',
	})
	@ApiResponse({
		status: 403,
		description: 'No tienes permisos para acceder a este recurso',
	})
	@ApiResponse({
		status: 404,
		description: 'Permiso no encontrado',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async deletePermission(@Param('id', ParseIntPipe) id: number) {
		return await this.authorizationService.deletePermission(id);
	}
}
