import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@IsNotEmpty({ message: 'El username es requerido' })
	@IsString({ message: 'El username debe ser una cadena de texto' })
	username: string;

	@IsNotEmpty({ message: 'El password es requerido' })
	@IsString({ message: 'El password debe ser una cadena de texto' })
	password: string;
}
