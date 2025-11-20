import {
	ConflictException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StatusEnum } from './entities/user.entity';
import { Experto } from './entities/experto.entity';
import { Administrador } from './entities/administrador.entity';
import { Cliente } from './entities/cliente.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '../authorization/entities/role.entity';
import { ExpertoRole } from '../authorization/entities/experto-role.entity';
import { AdministradorRole } from '../authorization/entities/administrador-role.entity';
import { hashPassword } from '../../utils/password.utility';
import { CreateUserAdminDto } from './dtos/create-user-admin.dto';
import { processTransaction } from '../../utils/transaction';

@Injectable()
export class UsersService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Experto)
		private readonly expertoRepository: Repository<Experto>,
		@InjectRepository(Administrador)
		private readonly administradorRepository: Repository<Administrador>,
		@InjectRepository(Cliente)
		private readonly clienteRepository: Repository<Cliente>,
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
		@InjectRepository(ExpertoRole)
		private readonly expertoRoleRepository: Repository<ExpertoRole>,
		@InjectRepository(AdministradorRole)
		private readonly administradorRoleRepository: Repository<AdministradorRole>,
	) {}

	async findAllUsers() {
		try {
			const [expertos, administradores, clientes] = await Promise.all([
				this.expertoRepository.find({ where: { status: StatusEnum.ACTIVE } }),
				this.administradorRepository.find({ where: { status: StatusEnum.ACTIVE } }),
				this.clienteRepository.find({ where: { status: StatusEnum.ACTIVE } }),
			]);

			const allUsers = [
				...expertos.map(u => ({ ...u, type: 'experto' })),
				...administradores.map(u => ({ ...u, type: 'administrador' })),
				...clientes.map(u => ({ ...u, type: 'cliente' })),
			];

			if (allUsers.length === 0) {
				return {
					message: 'No se encontraron usuarios',
					data: [],
					status: HttpStatus.OK,
				};
			}

			return {
				message: 'Usuarios obtenidos correctamente',
				data: allUsers,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al obtener los usuarios',
			);
		}
	}

	async findAllClientes() {
		try {
			const clientes = await this.clienteRepository.find({ 
				where: { status: StatusEnum.ACTIVE } 
			});

			if (clientes.length === 0) {
				return {
					message: 'No se encontraron clientes',
					data: [],
					status: HttpStatus.OK,
				};
			}

			return {
				message: 'Clientes obtenidos correctamente',
				data: clientes,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				'Error al obtener los clientes',
			);
		}
	}

	async findUsersWithRoles() {
		try {
			const [expertosRoles, administradoresRoles] = await Promise.all([
				this.expertoRoleRepository.find({
					where: { status: StatusEnum.ACTIVE },
					relations: ['experto', 'role'],
				}),
				this.administradorRoleRepository.find({
					where: { status: StatusEnum.ACTIVE },
					relations: ['administrador', 'role'],
				}),
			]);

			const usersWithRoles = [
				...expertosRoles.map(ur => ({ ...ur, user: ur.experto, type: 'experto' })),
				...administradoresRoles.map(ur => ({ ...ur, user: ur.administrador, type: 'administrador' })),
			];

			return {
				message: 'Usuarios obtenidos correctamente',
				data: usersWithRoles,
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
			// Buscar en todas las tablas
			const [experto, administrador, cliente] = await Promise.all([
				this.expertoRepository.findOne({ where: { id } }),
				this.administradorRepository.findOne({ where: { id } }),
				this.clienteRepository.findOne({ where: { id } }),
			]);

			const user = experto || administrador || cliente;
			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			const userType = experto ? 'experto' : administrador ? 'administrador' : 'cliente';

			return {
				message: 'Usuario obtenido correctamente',
				data: { ...user, type: userType },
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
			// Buscar por username o email en todas las tablas
			const [experto, administrador, cliente] = await Promise.all([
				this.expertoRepository.findOne({
					where: [
						{ username },
						{ email: username }
					],
				}),
				this.administradorRepository.findOne({
					where: [
						{ username },
						{ email: username }
					],
				}),
				this.clienteRepository.findOne({
					where: [
						{ username },
						{ email: username }
					],
				}),
			]);

			const user = experto || administrador || cliente;
			if (!user) {
				return {
					message: 'Usuario no encontrado',
					data: null,
					status: HttpStatus.NOT_FOUND,
				};
			}

			const userType = experto ? 'experto' : administrador ? 'administrador' : 'cliente';

			return {
				message: 'Usuario obtenido correctamente',
				data: { ...user, type: userType },
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error('Error en findUserByUsername:', error);
			throw new InternalServerErrorException(
				'Error al obtener el usuario',
			);
		}
	}

	// Este es el crear que usaran los usuarios normales (se crean como Cliente)
	async createUser(createUserDto: CreateUserDto) {
		try {
			// Validar si existe algún dato repetido en todas las tablas
			const [expertoExists, administradorExists, clienteExists] = await Promise.all([
				this.expertoRepository.findOne({
					where: [
						{ username: createUserDto.username },
						{ email: createUserDto.email }
					],
				}),
				this.administradorRepository.findOne({
					where: [
						{ username: createUserDto.username },
						{ email: createUserDto.email }
					],
				}),
				this.clienteRepository.findOne({
					where: [
						{ username: createUserDto.username },
						{ email: createUserDto.email }
					],
				}),
			]);

			if (expertoExists || administradorExists || clienteExists) {
				throw new ConflictException('El username o email ya existe');
			}

			// Hashear la contraseña antes de guardar
			const hashedPassword = await hashPassword(createUserDto.password);
			
			// Crear el cliente (los usuarios que se registran públicamente son clientes)
			const clienteData = {
				username: createUserDto.username,
				email: createUserDto.email,
				password_hash: hashedPassword,
			};

			const cliente = await this.clienteRepository.save(clienteData);

			return {
				message: 'Usuario creado correctamente',
				data: { ...cliente, type: 'cliente' },
				status: HttpStatus.CREATED,
			};
		} catch (error) {
			console.error('Error en createUser:', error);
			if (error instanceof ConflictException) {
				throw error;
			}
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

					// Validar que no existe el usuario en ninguna tabla
					const [expertoExists, administradorExists, clienteExists] = await Promise.all([
						queryRunner.manager.getRepository(Experto).findOne({
							where: [
								{ username: userData.username },
								{ email: userData.email }
							],
						}),
						queryRunner.manager.getRepository(Administrador).findOne({
							where: [
								{ username: userData.username },
								{ email: userData.email }
							],
						}),
						queryRunner.manager.getRepository(Cliente).findOne({
							where: [
								{ username: userData.username },
								{ email: userData.email }
							],
						}),
					]);

					if (expertoExists || administradorExists || clienteExists) {
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
					
					// Determinar qué tipo de usuario crear según el rol
					// rol 1 = admin -> Administrador
					// rol 2 = user o rol 8 = experto -> Experto
					let user: Experto | Administrador;
					let userRole: ExpertoRole | AdministradorRole;

					if (role_id === 1) {
						// Crear Administrador
						console.log('🔧 createUserByAdmin: Creating Administrador...');
						user = await queryRunner.manager
							.getRepository(Administrador)
							.save({
								...userWithoutPassword,
								password_hash: hashedPassword,
							});
						console.log('🔧 createUserByAdmin: Administrador saved successfully:', user);

						console.log('🔧 createUserByAdmin: Creating administrador role...');
						userRole = await queryRunner.manager
							.getRepository(AdministradorRole)
							.save({
								administrador_id: user.id,
								role_id: role_id,
							});
						console.log('🔧 createUserByAdmin: Administrador role created successfully:', userRole);

						return {
							message: 'Usuario creado correctamente',
							data: { ...user, role_id: userRole.role_id, type: 'administrador' },
							status: HttpStatus.CREATED,
						};
					} else {
						// Crear Experto (para rol 2 o 8)
						console.log('🔧 createUserByAdmin: Creating Experto...');
						user = await queryRunner.manager
							.getRepository(Experto)
							.save({
								...userWithoutPassword,
								password_hash: hashedPassword,
							});
						console.log('🔧 createUserByAdmin: Experto saved successfully:', user);

						console.log('🔧 createUserByAdmin: Creating experto role...');
						userRole = await queryRunner.manager
							.getRepository(ExpertoRole)
							.save({
								experto_id: user.id,
								role_id: role_id,
							});
						console.log('🔧 createUserByAdmin: Experto role created successfully:', userRole);

						return {
							message: 'Usuario creado correctamente',
							data: { ...user, role_id: userRole.role_id, type: 'experto' },
							status: HttpStatus.CREATED,
						};
					}
				},
			);
		} catch (error) {
			console.error('Error en createUserByAdmin:', error);
			if (error instanceof ConflictException || error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Error al crear el usuario');
		}
	}

	async updateUser(updateUserDto: UpdateUserDto) {
		try {
			// Buscar el usuario en todas las tablas
			const [experto, administrador, cliente] = await Promise.all([
				this.expertoRepository.findOne({ where: { id: updateUserDto.id } }),
				this.administradorRepository.findOne({ where: { id: updateUserDto.id } }),
				this.clienteRepository.findOne({ where: { id: updateUserDto.id } }),
			]);

			const user = experto || administrador || cliente;
			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			// Actualizar según el tipo
			let updatedUser;
			if (experto) {
				await this.expertoRepository.update(updateUserDto.id, updateUserDto);
				updatedUser = await this.expertoRepository.findOne({ where: { id: updateUserDto.id } });
			} else if (administrador) {
				await this.administradorRepository.update(updateUserDto.id, updateUserDto);
				updatedUser = await this.administradorRepository.findOne({ where: { id: updateUserDto.id } });
			} else {
				await this.clienteRepository.update(updateUserDto.id, updateUserDto);
				updatedUser = await this.clienteRepository.findOne({ where: { id: updateUserDto.id } });
			}

			return {
				message: 'Usuario actualizado correctamente',
				data: updatedUser,
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Error al actualizar el usuario',
			);
		}
	}

	async deleteUser(id: number) {
		try {
			// Buscar el usuario en todas las tablas
			const [experto, administrador, cliente] = await Promise.all([
				this.expertoRepository.findOne({ where: { id } }),
				this.administradorRepository.findOne({ where: { id } }),
				this.clienteRepository.findOne({ where: { id } }),
			]);

			const user = experto || administrador || cliente;
			if (!user) {
				throw new NotFoundException('Usuario no encontrado');
			}

			// Desactivar según el tipo
			user.status = StatusEnum.DESACTIVE;
			user.deleted_at = new Date();

			if (experto) {
				await this.expertoRepository.save(user);
			} else if (administrador) {
				await this.administradorRepository.save(user);
			} else {
				await this.clienteRepository.save(user);
			}

			return {
				message: 'Usuario eliminado correctamente',
				status: HttpStatus.OK,
			};
		} catch (error) {
			console.error(error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException(
				'Error al eliminar el usuario',
			);
		}
	}
}
