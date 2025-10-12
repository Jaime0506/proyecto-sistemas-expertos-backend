import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleToUserDto {
	@ApiProperty({
		description: 'ID del usuario',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del usuario es requerido' })
	@IsNumber({}, { message: 'El ID del usuario debe ser un número' })
	user_id: number;

	@ApiProperty({
		description: 'ID del rol',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del rol es requerido' })
	@IsNumber({}, { message: 'El ID del rol debe ser un número' })
	role_id: number;
}
