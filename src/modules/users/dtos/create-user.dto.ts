import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		description: 'The username of the user',
		example: 'john_doe',
	})
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	username: string;

	@ApiProperty({
		description: 'The email of the user',
		example: 'john_doe@example.com',
	})
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'The password of the user',
		example: 'password',
	})
	@IsString()
	@IsNotEmpty()
	@IsStrongPassword()
	@MinLength(8)
	password: string;
}
