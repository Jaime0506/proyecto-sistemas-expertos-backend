import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Patch,
	Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserAdminDto } from './dtos/create-user-admin.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('all')
	findAllUsers() {
		return this.usersService.findAllUsers();
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
