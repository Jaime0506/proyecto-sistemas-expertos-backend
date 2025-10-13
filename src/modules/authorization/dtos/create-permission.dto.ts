import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
	@ApiProperty({
		description: 'Nombre del permiso',
		example: 'users:create',
		maxLength: 100,
	})
	@IsNotEmpty({ message: 'El nombre del permiso es requerido' })
	@IsString({ message: 'El nombre del permiso debe ser una cadena de texto' })
	@MaxLength(100, {
		message:
			'El nombre del permiso no puede exceder 100 caracteres, debe serguir el formato: modulo:accion o entidad:accion',
	})
	name: string;

	@ApiProperty({
		description: 'Descripción del permiso',
		example: 'Permite crear nuevos usuarios en el sistema',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'La descripción debe ser una cadena de texto' })
	description?: string;
}
