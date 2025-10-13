import {
	ConflictException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StatusEnum, User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '../authorization/entities/role.entity';
import { UserRole } from '../authorization/entities/user-role.entity';
import { hashPassword } from '../../utils/password.utility';
import { CreateUserAdminDto } from './dtos/create-user-admin.dto';
import { processTransaction } from 'src/utils/transaction';

@Injectable()
export class UsersService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
		@InjectRepository(UserRole)
		private readonly userRoleRepository: Repository<UserRole>,
	) {}

	async findAllUsers() {
		try {
			const users = await this.userRepository.find({
				where: {
					status: StatusEnum.ACTIVE,
				},
			});

			if (users.length === 0) {
				return {
					message: 'No se encontraron usuarios',
					data: [],
					status: HttpStatus.OK,
				};
			}

			return {
				message: 'Usuarios obtenidos correctamente',
				data: users,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al obtener los usuarios',
			);
		}
	}

	async findUsersWithRoles() {
		try {
			const users = await this.userRoleRepository.find({
				where: { status: StatusEnum.ACTIVE },
				relations: ['user', 'role'],
			});

			return {
				message: 'Usuarios obtenidos correctamente',
				data: users,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al obtener los usuarios con roles',
			);
		}
	}

	async findUserById(id: number) {
		try {
			const user = await this.userRepository.findOne({ where: { id } });
			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			return {
				message: 'Usuario obtenido correctamente',
				data: user,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al obtener el usuario',
			);
		}
	}

	async findUserByUsername(username: string) {
		try {
			// Buscar por username o email
			const user = await this.userRepository.findOne({
				where: [
					{ username },
					{ email: username }
				],
			});

			if (!user) {
				return {
					message: 'Usuario no encontrado',
					data: null,
					status: HttpStatus.NOT_FOUND,
				};
			}

			return {
				message: 'Usuario obtenido correctamente',
				data: user,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error('Error en findUserByUsername:', error);
			throw new InternalServerErrorException(
				'Error al obtener el usuario',
			);
		}
	}

	// Este es el crear que usaran los usuarios normales
	async createUser(createUserDto: CreateUserDto) {
		try {
			// Valido si existe algun dato repetido, de las unique
			const userExists = await this.userRepository.findOne({
				where: {
					username: createUserDto.username,
					email: createUserDto.email,
				},
			});

			if (userExists) {
				throw new ConflictException('El username o email ya existe');
			}

			// Hashear la contraseña antes de guardar
			const hashedPassword = await hashPassword(createUserDto.password);
			
			// Crear el objeto usuario con la contraseña hasheada
			const userData = {
				username: createUserDto.username,
				email: createUserDto.email,
				password_hash: hashedPassword,
			};

			const user = await this.userRepository.save(userData);

			// Asigno el rol al usuario
			const userRole = await this.userRoleRepository.save({
				user_id: user.id,
				role_id: 2,
			});

			if (!userRole) {
				throw new NotFoundException(
					'Error al asignar el rol al usuario',
				);
			}

			return {
				message: 'Usuario creado correctamente',
				data: user,
				status: HttpStatus.CREATED,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException('Error al crear el usuario');
		}
	}

	// Este es el crear que usaran los administradores
	async createUserByAdmin(createUserDto: CreateUserAdminDto) {
		try {
			console.log('🔧 createUserByAdmin: Starting with data:', createUserDto);
			return await processTransaction(
				this.dataSource,
				async (queryRunner) => {
					const { role_id, ...userData } = createUserDto;
					console.log('🔧 createUserByAdmin: Extracted data:', { role_id, userData });

					// Validar que no existe el usuario
					const userExists = await queryRunner.manager
						.getRepository(User)
						.findOne({
							where: {
								username: userData.username,
								email: userData.email,
							},
						});

					if (userExists) {
						throw new ConflictException(
							'El username o email ya existe',
						);
					}

					// Validar que existe el rol
					const roleExists = await queryRunner.manager
						.getRepository(Role)
						.findOne({
							where: { id: role_id },
						});

					if (!roleExists) {
						throw new NotFoundException('Rol no encontrado');
					}

					// Hashear la contraseña antes de guardar
					console.log('🔧 createUserByAdmin: Hashing password...');
					const hashedPassword = await hashPassword(userData.password);
					console.log('🔧 createUserByAdmin: Password hashed successfully');
					
					// Crear el objeto usuario sin el campo password
					const { password, ...userWithoutPassword } = userData;
					console.log('🔧 createUserByAdmin: User data without password:', userWithoutPassword);
					
					console.log('🔧 createUserByAdmin: Saving user...');
					const user = await queryRunner.manager
						.getRepository(User)
						.save({
							...userWithoutPassword,
							password_hash: hashedPassword,
						});
					console.log('🔧 createUserByAdmin: User saved successfully:', user);

					console.log('🔧 createUserByAdmin: Creating user role...');
					const userRole = await queryRunner.manager
						.getRepository(UserRole)
						.save({
							user_id: user.id,
							role_id: role_id,
						});
					console.log('🔧 createUserByAdmin: User role created successfully:', userRole);

					return {
						message: 'Usuario creado correctamente',
						data: { ...user, role_id: userRole.role_id },
						status: HttpStatus.CREATED,
					};
				},
			);
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException('Error al crear el usuario');
		}
	}

	async updateUser(updateUserDto: UpdateUserDto) {
		try {
			// Existe el usuario?
			const user = await this.userRepository.findOne({
				where: { id: updateUserDto.id },
			});

			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			const updatedUser = await this.userRepository.update(
				updateUserDto.id,
				updateUserDto,
			);

			return {
				message: 'Usuario actualizado correctamente',
				data: updatedUser,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al actualizar el usuario',
			);
		}
	}

	async deleteUser(id: number) {
		try {
			// Existe el usuario?
			const user = await this.userRepository.findOne({ where: { id } });
			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			user.status = StatusEnum.DESACTIVE;
			user.deleted_at = new Date();

			await this.userRepository.save(user);

			return {
				message: 'Usuario eliminado correctamente',
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al eliminar el usuario',
			);
		}
	}
}
