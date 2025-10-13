import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		description: 'The username or email of the user',
		example: 'john_doe or john@example.com',
	})
	@IsNotEmpty({ message: 'El username o email es requerido' })
	@IsString({ message: 'El username o email debe ser una cadena de texto' })
	username: string;

	@ApiProperty({
		description: 'The password of the user',
		example: 'password123',
	})
	@IsNotEmpty({ message: 'El password es requerido' })
	@IsString({ message: 'El password debe ser una cadena de texto' })
	password: string;
}
