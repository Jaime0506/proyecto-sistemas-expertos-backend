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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthorizationService } from '../authorization.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { CreateRoleWithPermissionsDto } from '../dtos/create-role-with-permissions';
import { UpdateRoleWithPermissionsDto } from '../dtos/update-role-with-permissions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserType } from '../../auth/entities/refresh-token.entity';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMINISTRADOR)
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

	@Get('all-with-permissions')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener todos los roles con sus permisos' })
	@ApiResponse({
		status: 200,
		description: 'Roles con permisos obtenidos exitosamente',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async getRolesWithPermissions() {
		return await this.authorizationService.getAllRolesWithPermissions();
	}

	@Get('user/:userId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Obtener los roles de un usuario' })
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

	@Post('create-with-permissions')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Crear un nuevo rol con permisos' })
	@ApiResponse({
		status: 201,
		description: 'Rol creado exitosamente',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async createRoleWithPermissions(
		@Body() createRoleDto: CreateRoleWithPermissionsDto,
	) {
		return await this.authorizationService.createRoleWithPermissions(
			createRoleDto,
		);
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

	@Put('update-with-permissions')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Actualizar un rol existente con permisos' })
	@ApiResponse({
		status: 200,
		description: 'Rol actualizado exitosamente',
	})
	@ApiResponse({
		status: 500,
		description: 'Error interno del servidor',
	})
	async updateRoleWithPermissions(
		@Body() updateRoleDto: UpdateRoleWithPermissionsDto,
	) {
		return await this.authorizationService.updateRoleWithPermissions(
			updateRoleDto,
		);
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
