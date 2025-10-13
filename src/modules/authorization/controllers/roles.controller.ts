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
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
	constructor(private readonly authorizationService: AuthorizationService) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener todos los roles' })
	@ApiResponse({
		status: 200,
		description: 'Roles obtenidos exitosamente',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getRoles() {
		return await this.authorizationService.getRoles();
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Crear un nuevo rol' })
	@ApiResponse({
		status: 201,
		description: 'Rol creado exitosamente',
	})
	@ApiResponse({
		status: 409,
		description: 'El nombre del rol ya existe',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async createRole(@Body() createRoleDto: CreateRoleDto) {
		return await this.authorizationService.createRole(createRoleDto);
	}

	@Put()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Actualizar un rol existente' })
	@ApiResponse({
		status: 200,
		description: 'Rol actualizado exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Rol no encontrado',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async updateRole(@Body() updateRoleDto: UpdateRoleDto) {
		return await this.authorizationService.updateRole(updateRoleDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Eliminar un rol (soft delete)' })
	@ApiParam({
		name: 'id',
		description: 'ID del rol a eliminar',
		type: 'number',
	})
	@ApiResponse({
		status: 200,
		description: 'Rol eliminado exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Rol no encontrado',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async deleteRole(@Param('id', ParseIntPipe) id: number) {
		return await this.authorizationService.deleteRole(id);
	}
}
