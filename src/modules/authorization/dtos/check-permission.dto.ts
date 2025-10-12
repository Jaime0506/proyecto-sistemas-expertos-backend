import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckPermissionDto {
	@ApiProperty({
		description: 'ID del usuario',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del usuario es requerido' })
	@IsNumber({}, { message: 'El ID del usuario debe ser un número' })
	user_id: number;

	@ApiProperty({
		description: 'Nombre del permiso a verificar',
		example: 'users.create',
	})
	@IsNotEmpty({ message: 'El nombre del permiso es requerido' })
	@IsString({ message: 'El nombre del permiso debe ser una cadena de texto' })
	permission_name: string;
}
