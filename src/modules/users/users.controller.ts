import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// @Post('create')
	// createUser(@Body() createUserDto: CreateUserDto) {

	// }
}
