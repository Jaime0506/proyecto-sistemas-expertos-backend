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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthorizationService } from '../authorization.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
	constructor(private readonly authorizationService: AuthorizationService) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener todos los permisos' })
	@ApiResponse({
		status: 200,
		description: 'Permisos obtenidos exitosamente',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getAllPermissions() {
		return await this.authorizationService.getPermissions();
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Crear un nuevo permiso' })
	@ApiResponse({
		status: 201,
		description: 'Permiso creado exitosamente',
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
	@ApiOperation({ summary: 'Obtener los permisos de un usuario' })
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
		status: 500,
		description: 'Error interno del servidor',
	})
	async getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
		return await this.authorizationService.getUserPermissions(userId);
	}

	@Put()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Actualizar un permiso existente' })
	@ApiResponse({
		status: 200,
		description: 'Permiso actualizado exitosamente',
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
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Eliminar un permiso (soft delete)' })
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
