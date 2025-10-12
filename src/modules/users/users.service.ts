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

@Injectable()
export class UsersService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
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
		} catch {
			throw new InternalServerErrorException(
				'Error al obtener los usuarios',
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
		} catch {
			throw new InternalServerErrorException(
				'Error al obtener el usuario',
			);
		}
	}

	// Este es el crear que usaran los admin
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

			const user = await this.userRepository.save(createUserDto);
			// Asigno el rol al usuario
			const role = await this.roleRepository.findOne({
				where: { id: createUserDto.role_id },
			});

			if (!role) {
				throw new NotFoundException('Rol no encontrado');
			}

			return {
				message: 'Usuario creado correctamente',
				data: user,
				status: HttpStatus.CREATED,
			};
		} catch {
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
		} catch {
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
		} catch {
			throw new InternalServerErrorException(
				'Error al eliminar el usuario',
			);
		}
	}
}
