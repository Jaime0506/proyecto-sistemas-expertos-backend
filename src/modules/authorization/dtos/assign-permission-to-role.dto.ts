import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionToRoleDto {
	@ApiProperty({
		description: 'ID del rol',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del rol es requerido' })
	@IsNumber({}, { message: 'El ID del rol debe ser un número' })
	role_id: number;

	@ApiProperty({
		description: 'ID del permiso',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del permiso es requerido' })
	@IsNumber({}, { message: 'El ID del permiso debe ser un número' })
	permission_id: number;
}
