import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Patch,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserAdminDto } from './dtos/create-user-admin.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../auth/entities/refresh-token.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMINISTRADOR)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('all')
	findAllUsers() {
		return this.usersService.findAllUsers();
	}

	@Get('clientes')
	@Roles(UserType.ADMINISTRADOR, UserType.EXPERTO)
	async findAllClientes() {
		return this.usersService.findAllClientes();
	}

	@Get('get-all-with-roles')
	findUsersWithRoles() {
		return this.usersService.findUsersWithRoles();
	}

	@Get('get-by-id')
	findUserById(@Param('id') id: number) {
		return this.usersService.findUserById(id);
	}

	@Get('get-by-username')
	findUserByUsername(@Param('username') username: string) {
		return this.usersService.findUserByUsername(username);
	}

	@Patch('update')
	updateUser(@Body() updateUserDto: UpdateUserDto) {
		return this.usersService.updateUser(updateUserDto);
	}

	@Delete('delete')
	deleteUser(@Param('id') id: number) {
		return this.usersService.deleteUser(id);
	}

	@Post('create-by-admin')
	createUserByAdmin(@Body() createUserDto: CreateUserAdminDto) {
		return this.usersService.createUserByAdmin(createUserDto);
	}
}
