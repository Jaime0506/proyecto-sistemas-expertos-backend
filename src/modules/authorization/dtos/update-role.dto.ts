import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
	@ApiProperty({
		description: 'ID del rol a actualizar',
		example: 1,
	})
	@IsNotEmpty({ message: 'El ID del rol es requerido' })
	@IsNumber({}, { message: 'El ID del rol debe ser un número' })
	id: number;
}
