import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
	@ApiProperty({
		description: 'Nombre del rol',
		example: 'admin',
		maxLength: 50,
	})
	@IsNotEmpty({ message: 'El nombre del rol es requerido' })
	@IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
	@MaxLength(50, {
		message: 'El nombre del rol no puede exceder 50 caracteres',
	})
	name: string;

	@ApiProperty({
		description: 'Descripción del rol',
		example: 'Rol de administrador con acceso completo al sistema',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'La descripción debe ser una cadena de texto' })
	description?: string;
}
