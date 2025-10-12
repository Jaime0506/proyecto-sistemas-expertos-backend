import {
	ConflictException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { StatusEnum, User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { AssignRoleToUserDto } from './dtos/assign-role-to-user.dto';
import { AssignPermissionToRoleDto } from './dtos/assign-permission-to-role.dto';
import { CheckPermissionDto } from './dtos/check-permission.dto';

@Injectable()
export class AuthorizationService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
		@InjectRepository(Permission)
		private readonly permissionRepository: Repository<Permission>,
		@InjectRepository(UserRole)
		private readonly userRoleRepository: Repository<UserRole>,
		@InjectRepository(RolePermission)
		private readonly rolePermissionRepository: Repository<RolePermission>,
	) {}

	// ==================== ROLE METHODS ====================

	async createRole(createRoleDto: CreateRoleDto) {
		try {
			const roleExists = await this.roleRepository.findOne({
				where: { name: createRoleDto.name },
			});

			if (roleExists) {
				throw new ConflictException('El nombre del rol ya existe');
			}

			const role = await this.roleRepository.save(createRoleDto);

			return {
				message: 'Rol creado correctamente',
				data: role,
				status: HttpStatus.CREATED,
			};
		} catch {
			throw new InternalServerErrorException('Error al crear el rol');
		}
	}

	async updateRole(updateRoleDto: UpdateRoleDto) {
		try {
			const role = await this.roleRepository.findOne({
				where: { id: updateRoleDto.id },
			});

			if (!role) {
				throw new NotFoundException('Rol no encontrado');
			}

			const updatedRole = await this.roleRepository.update(
				updateRoleDto.id,
				updateRoleDto,
			);

			return {
				message: 'Rol actualizado correctamente',
				data: updatedRole,
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al actualizar el rol',
			);
		}
	}

	async deleteRole(id: number) {
		try {
			const role = await this.roleRepository.findOne({ where: { id } });
			if (!role) {
				throw new NotFoundException('Rol no encontrado');
			}

			role.status = StatusEnum.DESACTIVE;
			role.deleted_at = new Date();

			await this.roleRepository.save(role);

			return {
				message: 'Rol eliminado correctamente',
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException('Error al eliminar el rol');
		}
	}

	// ==================== PERMISSION METHODS ====================

	async createPermission(createPermissionDto: CreatePermissionDto) {
		try {
			const permissionExists = await this.permissionRepository.findOne({
				where: { name: createPermissionDto.name },
			});

			if (permissionExists) {
				throw new ConflictException('El nombre del permiso ya existe');
			}

			const permission =
				await this.permissionRepository.save(createPermissionDto);

			return {
				message: 'Permiso creado correctamente',
				data: permission,
				status: HttpStatus.CREATED,
			};
		} catch {
			throw new InternalServerErrorException('Error al crear el permiso');
		}
	}

	async updatePermission(updatePermissionDto: UpdatePermissionDto) {
		try {
			const permission = await this.permissionRepository.findOne({
				where: { id: updatePermissionDto.id },
			});

			if (!permission) {
				throw new NotFoundException('Permiso no encontrado');
			}

			const updatedPermission = await this.permissionRepository.update(
				updatePermissionDto.id,
				updatePermissionDto,
			);

			return {
				message: 'Permiso actualizado correctamente',
				data: updatedPermission,
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al actualizar el permiso',
			);
		}
	}

	async deletePermission(id: number) {
		try {
			const permission = await this.permissionRepository.findOne({
				where: { id },
			});
			if (!permission) {
				throw new NotFoundException('Permiso no encontrado');
			}

			permission.status = StatusEnum.DESACTIVE;
			permission.deleted_at = new Date();

			await this.permissionRepository.save(permission);

			return {
				message: 'Permiso eliminado correctamente',
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al eliminar el permiso',
			);
		}
	}

	// ==================== ASSIGNMENT METHODS ====================

	async assignPermissionToRole(assignDto: AssignPermissionToRoleDto) {
		try {
			// Verificar que el rol existe
			const role = await this.roleRepository.findOne({
				where: { id: assignDto.role_id },
			});
			if (!role) {
				throw new NotFoundException('Rol no encontrado');
			}

			// Verificar que el permiso existe
			const permission = await this.permissionRepository.findOne({
				where: { id: assignDto.permission_id },
			});
			if (!permission) {
				throw new NotFoundException('Permiso no encontrado');
			}

			// Verificar que no existe ya la asignación
			const existingAssignment =
				await this.rolePermissionRepository.findOne({
					where: {
						role_id: assignDto.role_id,
						permission_id: assignDto.permission_id,
					},
				});

			if (existingAssignment) {
				throw new ConflictException(
					'El permiso ya está asignado al rol',
				);
			}

			const rolePermission = await this.rolePermissionRepository.save({
				role_id: assignDto.role_id,
				permission_id: assignDto.permission_id,
			});

			return {
				message: 'Permiso asignado al rol correctamente',
				data: rolePermission,
				status: HttpStatus.CREATED,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al asignar permiso al rol',
			);
		}
	}

	async revokePermissionFromRole(assignDto: AssignPermissionToRoleDto) {
		try {
			const rolePermission = await this.rolePermissionRepository.findOne({
				where: {
					role_id: assignDto.role_id,
					permission_id: assignDto.permission_id,
				},
			});

			if (!rolePermission) {
				throw new NotFoundException(
					'Asignación de permiso no encontrada',
				);
			}

			rolePermission.status = StatusEnum.DESACTIVE;
			rolePermission.deleted_at = new Date();

			await this.rolePermissionRepository.save(rolePermission);

			return {
				message: 'Permiso revocado del rol correctamente',
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al revocar permiso del rol',
			);
		}
	}

	async assignRoleToUser(assignDto: AssignRoleToUserDto) {
		try {
			// Verificar que el usuario existe
			const user = await this.userRepository.findOne({
				where: { id: assignDto.user_id },
			});
			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			// Verificar que el rol existe
			const role = await this.roleRepository.findOne({
				where: { id: assignDto.role_id },
			});
			if (!role) {
				throw new NotFoundException('Rol no encontrado');
			}

			// Verificar que no existe ya la asignación
			const existingAssignment = await this.userRoleRepository.findOne({
				where: {
					user_id: assignDto.user_id,
					role_id: assignDto.role_id,
				},
			});

			if (existingAssignment) {
				throw new ConflictException(
					'El rol ya está asignado al usuario',
				);
			}

			const userRole = await this.userRoleRepository.save({
				user_id: assignDto.user_id,
				role_id: assignDto.role_id,
			});

			return {
				message: 'Rol asignado al usuario correctamente',
				data: userRole,
				status: HttpStatus.CREATED,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al asignar rol al usuario',
			);
		}
	}

	async revokeRoleFromUser(assignDto: AssignRoleToUserDto) {
		try {
			const userRole = await this.userRoleRepository.findOne({
				where: {
					user_id: assignDto.user_id,
					role_id: assignDto.role_id,
				},
			});

			if (!userRole) {
				throw new NotFoundException('Asignación de rol no encontrada');
			}

			userRole.status = StatusEnum.DESACTIVE;
			userRole.deleted_at = new Date();

			await this.userRoleRepository.save(userRole);

			return {
				message: 'Rol revocado del usuario correctamente',
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al revocar rol del usuario',
			);
		}
	}

	// ==================== QUERY METHODS ====================

	async getUserRoles(user_id: number) {
		try {
			const userRoles = await this.userRoleRepository.find({
				where: { user_id, status: StatusEnum.ACTIVE },
				relations: ['role'],
			});

			const roles = userRoles.map((userRole) => userRole.role);

			return {
				message: 'Roles del usuario obtenidos correctamente',
				data: roles,
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al obtener roles del usuario',
			);
		}
	}

	async getRolePermissions(role_id: number) {
		try {
			const rolePermissions = await this.rolePermissionRepository.find({
				where: { role_id, status: StatusEnum.ACTIVE },
				relations: ['permission'],
			});

			const permissions = rolePermissions.map(
				(rolePermission) => rolePermission.permission,
			);

			return {
				message: 'Permisos del rol obtenidos correctamente',
				data: permissions,
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al obtener permisos del rol',
			);
		}
	}

	async hasPermission(checkDto: CheckPermissionDto) {
		try {
			// Obtener roles del usuario
			const userRoles = await this.userRoleRepository.find({
				where: { user_id: checkDto.user_id, status: StatusEnum.ACTIVE },
				relations: ['role'],
			});

			if (userRoles.length === 0) {
				return {
					message: 'Usuario sin permisos',
					data: { hasPermission: false },
					status: HttpStatus.OK,
				};
			}

			// Obtener todos los permisos de los roles del usuario
			const roleIds = userRoles.map((userRole) => userRole.role_id);
			const rolePermissions = await this.rolePermissionRepository.find({
				where: { role_id: In(roleIds), status: StatusEnum.ACTIVE },
				relations: ['permission'],
			});

			// Verificar si el usuario tiene el permiso específico
			const hasPermission = rolePermissions.some(
				(rolePermission) =>
					rolePermission.permission.name === checkDto.permission_name,
			);

			return {
				message: hasPermission
					? 'Usuario tiene el permiso'
					: 'Usuario no tiene el permiso',
				data: { hasPermission },
				status: HttpStatus.OK,
			};
		} catch {
			throw new InternalServerErrorException(
				'Error al verificar permiso del usuario',
			);
		}
	}
}
